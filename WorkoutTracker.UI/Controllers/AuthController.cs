using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using System;
using System.Linq;
using WorkoutTracker.Application.Security.Interfaces;
using WorkoutTracker.Application.Users.Interfaces;
using WorkoutTracker.UI.Auth;
using WorkoutTracker.UI.Models;

namespace WorkoutTracker.UI.Controllers
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

        public AuthController(
            IUserService userService, 
            ITokenService tokenService, 
            IConfiguration config, 
            ICryptoService cryptoService)
        {
            _userService = userService ?? throw new ArgumentNullException(nameof(userService));
            _tokenService = tokenService ?? throw new ArgumentNullException(nameof(tokenService));
            _config = config ?? throw new ArgumentNullException(nameof(config));
            _cryptoService = cryptoService ?? throw new ArgumentNullException(nameof(cryptoService));
        }

        [AllowAnonymous]
        [Route("login")]
        [HttpPost]
        public IActionResult Login(UserCredentialsDTO credentials)
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

            var token = 
                _tokenService.BuildToken(
                    _config["Jwt:Key"].ToString(), 
                    _config["Jwt:Issuer"].ToString(),
                    user);

            return new ContentResult { Content = token, StatusCode = 200 };
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
        public IActionResult RequestPasswordReset(PasswordResetRequest passwordResetRequest)
        {
            try
            {
                _userService.RequestPasswordReset(passwordResetRequest.EmailAddress);
                return Ok();
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        private bool IsCredentialsObjectValid(UserCredentialsDTO credentials)
        {
            return credentials != null
                && !string.IsNullOrWhiteSpace(credentials.Username);
                //&& !string.IsNullOrWhiteSpace(credentials.Password);
        }
    }
}
