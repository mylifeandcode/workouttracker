using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using System;
using System.Linq;
using WorkoutTracker.Application.Security.Interfaces;
using WorkoutTracker.Application.Users.Interfaces;
using WorkoutTracker.API.Auth;
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

        public AuthController(
            IUserService userService, 
            ITokenService tokenService, 
            IConfiguration config, 
            ICryptoService cryptoService,
            IRefreshTokenService refreshTokenService)
        {
            _userService = userService ?? throw new ArgumentNullException(nameof(userService));
            _tokenService = tokenService ?? throw new ArgumentNullException(nameof(tokenService));
            _config = config ?? throw new ArgumentNullException(nameof(config));
            _cryptoService = cryptoService ?? throw new ArgumentNullException(nameof(cryptoService));
            _refreshTokenService = refreshTokenService ?? throw new ArgumentNullException(nameof(refreshTokenService));
        }

        [AllowAnonymous]
        [Route("login")]
        [HttpPost]
        public ActionResult<AuthTokenResultDTO> Login(UserCredentialsDTO credentials)
        {
            if (!IsCredentialsObjectValid(credentials))
                return BadRequest();

            var user = _userService.GetAll().FirstOrDefault(x => x.Name == credentials.Username);

            if (user == null)
                return new NotFoundResult();

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

            var (rawRefreshToken, refreshTokenEntity) = _refreshTokenService.GenerateRefreshToken(user.Id);

            return Ok(new AuthTokenResultDTO { AccessToken = accessToken, RefreshToken = rawRefreshToken });
        }

        [AllowAnonymous]
        [Route("refresh")]
        [HttpPost]
        public ActionResult<AuthTokenResultDTO> Refresh(RefreshTokenRequestDTO request)
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
            var existingToken = _refreshTokenService.ValidateRefreshToken(request.RefreshToken, userId);
            if (existingToken == null)
                return Unauthorized();

            // Get the user to build a new access token
            var user = _userService.GetAll().FirstOrDefault(x => x.Id == userId);
            if (user == null)
                return Unauthorized();

            // Revoke old and create new refresh token
            var (newRawRefreshToken, _) = _refreshTokenService.RevokeAndReplace(existingToken, userId);

            // Build new access token
            int accessTokenLifetimeMinutes = int.TryParse(_config["Jwt:AccessTokenLifetimeMinutes"], out var minutes) ? minutes : 15;
            var newAccessToken = _tokenService.BuildToken(jwtKey, jwtIssuer, user, accessTokenLifetimeMinutes);

            return Ok(new AuthTokenResultDTO { AccessToken = newAccessToken, RefreshToken = newRawRefreshToken });
        }

        [Route("revoke")]
        [HttpPost]
        public IActionResult Revoke()
        {
            int userId = GetUserID();
            _refreshTokenService.RevokeByUserId(userId);
            return NoContent();
        }

        [Route("change-password")]
        [HttpPost]
        public IActionResult ChangePassword(PasswordChangeRequest passwordChangeRequest)
        {
            if(passwordChangeRequest == null) return BadRequest();

            try
            {
                int userId = GetUserID();

                _userService.ChangePassword(userId, passwordChangeRequest.CurrentPassword, passwordChangeRequest.NewPassword);
                _refreshTokenService.RevokeByUserId(userId);

                return Ok();
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [Route("request-password-reset")]
        [AllowAnonymous]
        [HttpPost]
        public ActionResult<string> RequestPasswordReset(RequestPasswordResetRequest request)
        {
            try
            {
                string resetCode = _userService.RequestPasswordReset(request.EmailAddress);
                return Ok(resetCode);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [Route("reset-password")]
        [AllowAnonymous]
        [HttpPost]
        public IActionResult ResetPassword(PasswordResetRequest request)
        {
            try
            {
                _userService.ResetPassword(request.ResetCode, request.NewPassword);
                return Ok();
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [Route("validate-reset-code/{resetCode}")]
        [AllowAnonymous]
        [HttpGet]
        public ActionResult<bool> ValidatePasswordResetCode(string resetCode)
        {
            return _userService.ValidatePasswordResetCode(resetCode);
        }

        private bool IsCredentialsObjectValid(UserCredentialsDTO credentials)
        {
            return credentials != null
                && !string.IsNullOrWhiteSpace(credentials.Username);
                //&& !string.IsNullOrWhiteSpace(credentials.Password);
        }
    }
}
