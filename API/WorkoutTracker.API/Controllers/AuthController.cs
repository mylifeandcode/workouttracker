using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using WorkoutTracker.Application.Security.Interfaces;
using WorkoutTracker.Application.Users.Interfaces;
using WorkoutTracker.Application.Users.Models;
using WorkoutTracker.API.Auth;
using WorkoutTracker.API.Mappers;
using WorkoutTracker.API.Models;

namespace WorkoutTracker.API.Controllers
{
    [Produces("application/json")]
    [Route("api/[controller]")]
    [EnableCors("SiteCorsPolicy")]
    [ApiController]
    public class AuthController : UserAwareController
    {
        private IUserService _userService;
        private ITokenService _tokenService;
        private IConfiguration _config;
        private ICryptoService _cryptoService;
        private IRefreshTokenService _refreshTokenService;
        private IUserDTOMapper _userDTOMapper;
        private IPasswordResetService _passwordResetService;

        public AuthController(
            IUserService userService,
            ITokenService tokenService,
            IConfiguration config,
            ICryptoService cryptoService,
            IRefreshTokenService refreshTokenService,
            IUserDTOMapper userDTOMapper,
            IPasswordResetService passwordResetService,
            ILoggerFactory loggerFactory) : base(loggerFactory)
        {
            _userService = userService ?? throw new ArgumentNullException(nameof(userService));
            _tokenService = tokenService ?? throw new ArgumentNullException(nameof(tokenService));
            _config = config ?? throw new ArgumentNullException(nameof(config));
            _cryptoService = cryptoService ?? throw new ArgumentNullException(nameof(cryptoService));
            _refreshTokenService = refreshTokenService ?? throw new ArgumentNullException(nameof(refreshTokenService));
            _userDTOMapper = userDTOMapper ?? throw new ArgumentNullException(nameof(userDTOMapper));
            _passwordResetService = passwordResetService ?? throw new ArgumentNullException(nameof(passwordResetService));
        }

        [AllowAnonymous]
        [Route("login")]
        [HttpPost]
        public async Task<ActionResult<AuthTokenResultDTO>> Login(UserCredentialsDTO credentials, CancellationToken cancellationToken = default)
        {
            if (!IsCredentialsObjectValid(credentials))
                return BadRequest();

            var user = await _userService.GetByNameAsync(credentials.Username, cancellationToken);

            if (user == null)
                return new NotFoundResult();

            //A deactivated user can't sign in (with or without SimpleLogin).
            if (!user.IsActive)
                return new UnauthorizedResult();

            if (!Convert.ToBoolean(_config["SimpleLogin"]))
            {
                if (!_cryptoService.VerifyValuesMatch(credentials.Password, user.HashedPassword, user.Salt))
                    return new UnauthorizedResult();
            }

            int accessTokenLifetimeMinutes = int.TryParse(_config["Jwt:AccessTokenLifetimeMinutes"], out var minutes) ? minutes : 15;

            var accessToken =
                _tokenService.BuildToken(
                    _config["Jwt:Key"].ToString(),
                    _config["Jwt:Issuer"].ToString(),
                    user,
                    accessTokenLifetimeMinutes);

            var (rawRefreshToken, refreshTokenEntity) = await _refreshTokenService.GenerateRefreshTokenAsync(user.Id, cancellationToken);

            return Ok(new AuthTokenResultDTO { AccessToken = accessToken, RefreshToken = rawRefreshToken });
        }

        [AllowAnonymous]
        [Route("refresh")]
        [HttpPost]
        public async Task<ActionResult<AuthTokenResultDTO>> Refresh(RefreshTokenRequestDTO request, CancellationToken cancellationToken = default)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.AccessToken) || string.IsNullOrWhiteSpace(request.RefreshToken))
                return BadRequest();

            var jwtKey = _config["Jwt:Key"].ToString();
            var jwtIssuer = _config["Jwt:Issuer"].ToString();

            // Extract user identity from the expired access token
            var principal = _tokenService.GetPrincipalFromExpiredToken(request.AccessToken, jwtKey, jwtIssuer);
            if (principal == null)
                return Unauthorized();

            var userIdClaim = principal.FindFirst("UserID")?.Value;
            if (userIdClaim == null || !int.TryParse(userIdClaim, out var userId))
                return Unauthorized();

            // Validate the refresh token
            var existingToken = await _refreshTokenService.ValidateRefreshTokenAsync(request.RefreshToken, userId, cancellationToken);
            if (existingToken == null)
                return Unauthorized();

            // Get the user to build a new access token
            var user = await _userService.GetByIdAsync(userId, cancellationToken);
            if (user == null || !user.IsActive)
                return Unauthorized();

            // Revoke old and create new refresh token
            var (newRawRefreshToken, _) = await _refreshTokenService.RevokeAndReplaceAsync(existingToken, userId, cancellationToken);

            // Build new access token
            int accessTokenLifetimeMinutes = int.TryParse(_config["Jwt:AccessTokenLifetimeMinutes"], out var minutes) ? minutes : 15;
            var newAccessToken = _tokenService.BuildToken(jwtKey, jwtIssuer, user, accessTokenLifetimeMinutes);

            return Ok(new AuthTokenResultDTO { AccessToken = newAccessToken, RefreshToken = newRawRefreshToken });
        }

        [AllowAnonymous]
        [Route("profiles")]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserProfileDTO>>> GetProfiles(CancellationToken cancellationToken = default)
        {
            var profiles = await _userService.GetAllProfilesAsync(cancellationToken);
            return Ok(_userDTOMapper.MapFromProfiles(profiles));
        }

        [Route("revoke")]
        [HttpPost]
        public async Task<IActionResult> Revoke(CancellationToken cancellationToken = default)
        {
            int userId = GetUserID();
            await _refreshTokenService.RevokeByUserIdAsync(userId, cancellationToken);
            return NoContent();
        }

        [Route("change-password")]
        [HttpPost]
        public async Task<IActionResult> ChangePassword(PasswordChangeRequest passwordChangeRequest, CancellationToken cancellationToken = default)
        {
            if(passwordChangeRequest == null) return BadRequest();

            int userId = GetUserID();

            try
            {
                await _userService.ChangePasswordAsync(userId, passwordChangeRequest.CurrentPassword, passwordChangeRequest.NewPassword, cancellationToken);
                await _refreshTokenService.RevokeByUserIdAsync(userId, cancellationToken);

                return Ok();
            }
            catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
            {
                throw;
            }
            catch (ApplicationException ex)
            {
                //UserService writes these messages for the user ("Current password is not correct.", the password rule).
                return Problem(statusCode: StatusCodes.Status400BadRequest, detail: ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error changing password for user {UserId}.", userId);
                return Problem(statusCode: StatusCodes.Status500InternalServerError);
            }
        }

        //The three actions below are anonymous (the person has forgotten their password), so each is rate limited, and
        //none of them says anything that tells a stranger whether an email address has an account.

        /// <summary>
        /// Always 204 with an empty body: if the address belongs to an active user and email is configured, they are
        /// emailed a one-time link, and otherwise nothing happens. The response is the same either way.
        /// </summary>
        [Route("request-password-reset")]
        [AllowAnonymous]
        [EnableRateLimiting("password-reset")]
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status429TooManyRequests)]
        public async Task<IActionResult> RequestPasswordReset(RequestPasswordResetRequest request, CancellationToken cancellationToken = default)
        {
            await _passwordResetService.RequestResetEmailAsync(request?.EmailAddress, cancellationToken);
            return NoContent();
        }

        /// <summary>
        /// Whether a reset link is still good, so the page can say so before asking for a new password. The token travels
        /// in the body, not the URL, so it never lands in request logs.
        /// </summary>
        [Route("validate-reset-token")]
        [AllowAnonymous]
        [EnableRateLimiting("password-reset")]
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status429TooManyRequests)]
        public async Task<ActionResult<bool>> ValidateResetToken(ValidateResetTokenRequest request, CancellationToken cancellationToken = default)
        {
            return Ok(await _passwordResetService.ValidateTokenAsync(request?.Token, cancellationToken));
        }

        [Route("reset-password")]
        [AllowAnonymous]
        [EnableRateLimiting("password-reset")]
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status429TooManyRequests)]
        public async Task<IActionResult> ResetPassword(PasswordResetRequest request, CancellationToken cancellationToken = default)
        {
            var outcome = await _passwordResetService.ResetPasswordAsync(request?.Token, request?.NewPassword, cancellationToken);

            return outcome.Result switch
            {
                PasswordResetResult.Done => NoContent(),
                //The same answer for a token that is unknown, expired, used, or belongs to a deactivated user.
                PasswordResetResult.InvalidPassword => Problem(statusCode: StatusCodes.Status400BadRequest, detail: outcome.Message),
                _ => Problem(statusCode: StatusCodes.Status400BadRequest, detail: "This reset link is invalid or has expired.")
            };
        }

        private bool IsCredentialsObjectValid(UserCredentialsDTO credentials)
        {
            return credentials != null
                && !string.IsNullOrWhiteSpace(credentials.Username);
                //&& !string.IsNullOrWhiteSpace(credentials.Password);
        }
    }
}
