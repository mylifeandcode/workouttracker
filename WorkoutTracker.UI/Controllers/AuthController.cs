using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using WorkoutTracker.Application.Users.Interfaces;
using WorkoutTracker.UI.Auth;
using WorkoutTracker.UI.Models;

namespace WorkoutTracker.UI.Controllers
{
    [Produces("application/json")]
    [Route("api/[controller]")]
    [EnableCors("SiteCorsPolicy")]
    [ApiController]
    public class AuthController : ControllerBase
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
                if (!VerifyPasswordMatches(credentials.Password, user.HashedPassword, user.Salt))
                    return new UnauthorizedResult();
            }

            var token = 
                _tokenService.BuildToken(
                    _config["Jwt:Key"].ToString(), 
                    _config["Jwt:Issuer"].ToString(),
                    user);

            return new ContentResult { Content = token, StatusCode = 200 };
        }

        private bool IsCredentialsObjectValid(UserCredentialsDTO credentials)
        {
            return credentials != null
                && !string.IsNullOrWhiteSpace(credentials.Username);
                //&& !string.IsNullOrWhiteSpace(credentials.Password);
        }

        private bool VerifyPasswordMatches(string clearTextPassword, string hashedPassword, string salt)
        {
            string passwordHashedFromClearText = _cryptoService.ComputeHash(clearTextPassword, salt);
            return passwordHashedFromClearText == hashedPassword;
        }
    }
}
