using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Security.Claims;
using System.Threading.Tasks;
using WorkoutTracker.Application.Security.Interfaces;
using WorkoutTracker.Application.Users.Interfaces;
using WorkoutTracker.Domain.Users;
using WorkoutTracker.API.Auth;
using WorkoutTracker.API.Controllers;
using WorkoutTracker.API.Models;

namespace WorkoutTracker.Tests.Controllers
{
    [TestClass]
    public class AuthControllerTests : UserAwareControllerTestsBase
    {
        private Mock<IUserService> _userServiceMock;
        private Mock<ITokenService> _tokenServiceMock;
        private IConfiguration _configuration;
        private Mock<ICryptoService> _cryptoServiceMock;
        private Mock<IRefreshTokenService> _refreshTokenServiceMock;
        private AuthController _sut;

        [TestInitialize]
        public void Initialize()
        {
            _userServiceMock = new Mock<IUserService>(MockBehavior.Strict);
            _userServiceMock
                .Setup(x => x.GetAllAsync())
                .ReturnsAsync(new List<User>(2)
                    {
                        new User { Id = 1, Name = "Kirk", HashedPassword = "oijosidjfsgd", Salt = "iunfidnfgfd" },
                        new User { Id = 2, Name = "Spock", HashedPassword = "njnfdgdfufgdf", Salt = " jsnkjnbfdf8" }
                    });
            _userServiceMock
                .Setup(x => x.ChangePasswordAsync(It.IsAny<int>(), It.IsAny<string>(), It.IsAny<string>()))
                .Returns(Task.CompletedTask);
            _userServiceMock
                .Setup(x => x.RequestPasswordResetAsync(It.IsAny<string>()))
                .ReturnsAsync("someResetCode");
            _userServiceMock
                .Setup(x => x.ResetPasswordAsync(It.IsAny<string>(), It.IsAny<string>()))
                .Returns(Task.CompletedTask);
            _userServiceMock
                .Setup(x => x.ValidatePasswordResetCodeAsync(It.IsAny<string>()))
                .ReturnsAsync(true);

            _tokenServiceMock = new Mock<ITokenService>(MockBehavior.Strict);
            _tokenServiceMock
                .Setup(x => x.BuildToken(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<User>(), It.IsAny<int>()))
                .Returns("someToken");

            _configuration = GetConfiguration(true);

            _cryptoServiceMock = new Mock<ICryptoService>(MockBehavior.Strict);
            _cryptoServiceMock
                .Setup(x => x.VerifyValuesMatch(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()))
                .Returns(true);

            _refreshTokenServiceMock = new Mock<IRefreshTokenService>(MockBehavior.Strict);
            _refreshTokenServiceMock
                .Setup(x => x.GenerateRefreshTokenAsync(It.IsAny<int>()))
                .ReturnsAsync(("someRawRefreshToken", new RefreshToken { Id = 1 }));
            _refreshTokenServiceMock
                .Setup(x => x.RevokeByUserIdAsync(It.IsAny<int>()))
                .Returns(Task.CompletedTask);

            _sut = new AuthController(_userServiceMock.Object, _tokenServiceMock.Object, _configuration, _cryptoServiceMock.Object, _refreshTokenServiceMock.Object);
        }

        [TestMethod]
        public async Task Should_Log_User_In_Using_Simple_Login_When_User_Is_Found()
        {
            //ARRANGE
            var credentials = new UserCredentialsDTO();
            credentials.Username = "Spock";

            //ACT
            var result = await _sut.Login(credentials);

            //ASSERT
            Assert.IsInstanceOfType(result, typeof(ActionResult<AuthTokenResultDTO>));
            var okResult = (OkObjectResult)result.Result;
            var tokenResult = (AuthTokenResultDTO)okResult.Value;
            Assert.AreEqual("someToken", tokenResult.AccessToken);
            Assert.AreEqual("someRawRefreshToken", tokenResult.RefreshToken);
            _userServiceMock.Verify(x => x.GetAllAsync(), Times.Once);
            _cryptoServiceMock.Verify(x => x.VerifyValuesMatch(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()), Times.Never);
            _tokenServiceMock.Verify(x => x.BuildToken("SomeKey", "SomeIssuer", It.IsAny<User>(), 15), Times.Once);
            _refreshTokenServiceMock.Verify(x => x.GenerateRefreshTokenAsync(It.IsAny<int>()), Times.Once);
        }

        [TestMethod]
        public async Task Should_Log_User_In_Using_Normal_Login_When_User_Is_Found()
        {
            //ARRANGE
            _configuration = GetConfiguration(false);

            //TODO: Troubleshoot. The updated config doesn't take unless I recreate the controller.
            _sut = new AuthController(_userServiceMock.Object, _tokenServiceMock.Object, _configuration, _cryptoServiceMock.Object, _refreshTokenServiceMock.Object);

            var credentials = new UserCredentialsDTO();
            credentials.Username = "Spock";

            //ACT
            var result = await _sut.Login(credentials);

            //ASSERT
            Assert.IsInstanceOfType(result, typeof(ActionResult<AuthTokenResultDTO>));
            var okResult = (OkObjectResult)result.Result;
            var tokenResult = (AuthTokenResultDTO)okResult.Value;
            Assert.AreEqual("someToken", tokenResult.AccessToken);
            Assert.AreEqual("someRawRefreshToken", tokenResult.RefreshToken);
            _userServiceMock.Verify(x => x.GetAllAsync(), Times.Once);
            _cryptoServiceMock.Verify(x => x.VerifyValuesMatch(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()), Times.Once);
            _tokenServiceMock.Verify(x => x.BuildToken("SomeKey", "SomeIssuer", It.IsAny<User>(), 15), Times.Once);
            _refreshTokenServiceMock.Verify(x => x.GenerateRefreshTokenAsync(It.IsAny<int>()), Times.Once);
        }

        [TestMethod]
        public async Task Should_Return_Not_Found_Result_From_Login_When_User_Not_Found()
        {
            //ARRANGE
            var credentials = new UserCredentialsDTO();
            credentials.Username = "Bones";

            //ACT
            var result = await _sut.Login(credentials);

            //ASSERT
            Assert.IsInstanceOfType(result, typeof(ActionResult<AuthTokenResultDTO>));
            var notFoundResult = (NotFoundResult)result.Result;
            Assert.AreEqual((int)HttpStatusCode.NotFound, notFoundResult.StatusCode);
            _userServiceMock.Verify(x => x.GetAllAsync(), Times.Once);
            _cryptoServiceMock.Verify(x => x.VerifyValuesMatch(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()), Times.Never);
            _tokenServiceMock.Verify(x => x.BuildToken("SomeKey", "SomeIssuer", It.IsAny<User>(), It.IsAny<int>()), Times.Never);
        }

        [TestMethod]
        public async Task Should_Return_UnauthorizedResult_From_Login_When_Credentials_Are_Incorrect()
        {
            //ARRANGE
            _configuration = GetConfiguration(false);
            _cryptoServiceMock
                .Setup(x => x.VerifyValuesMatch(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()))
                .Returns(false);

            //TODO: Troubleshoot. The updated config doesn't take unless I recreate the controller.
            _sut = new AuthController(_userServiceMock.Object, _tokenServiceMock.Object, _configuration, _cryptoServiceMock.Object, _refreshTokenServiceMock.Object);

            var credentials = new UserCredentialsDTO();
            credentials.Username = "Spock";
            credentials.Password = "Kolinahr123!!!";

            //ACT
            var result = await _sut.Login(credentials);

            //ASSERT
            Assert.IsInstanceOfType(result.Result, typeof(UnauthorizedResult));
            var unauthorizedResult = (UnauthorizedResult)result.Result;
            Assert.AreEqual((int)HttpStatusCode.Unauthorized, unauthorizedResult.StatusCode);
            _userServiceMock.Verify(x => x.GetAllAsync(), Times.Once);
            _cryptoServiceMock.Verify(x => x.VerifyValuesMatch(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()), Times.Once);
            _tokenServiceMock.Verify(x => x.BuildToken("SomeKey", "SomeIssuer", It.IsAny<User>(), It.IsAny<int>()), Times.Never);
        }

        [TestMethod]
        public async Task Should_Refresh_Token_Successfully()
        {
            //ARRANGE
            var existingToken = new RefreshToken { Id = 1, UserId = 2, IsRevoked = false };
            var principal = new ClaimsPrincipal(new ClaimsIdentity(new[]
            {
                new Claim("UserID", "2"),
                new Claim(ClaimTypes.Name, "Spock")
            }));

            _tokenServiceMock
                .Setup(x => x.GetPrincipalFromExpiredToken(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()))
                .Returns(principal);

            _refreshTokenServiceMock
                .Setup(x => x.ValidateRefreshTokenAsync(It.IsAny<string>(), 2))
                .ReturnsAsync(existingToken);

            _refreshTokenServiceMock
                .Setup(x => x.RevokeAndReplaceAsync(existingToken, 2))
                .ReturnsAsync(("newRawRefreshToken", new RefreshToken { Id = 2 }));

            var request = new RefreshTokenRequestDTO
            {
                AccessToken = "expiredAccessToken",
                RefreshToken = "validRefreshToken"
            };

            //ACT
            var result = await _sut.Refresh(request);

            //ASSERT
            Assert.IsInstanceOfType(result, typeof(ActionResult<AuthTokenResultDTO>));
            var okResult = (OkObjectResult)result.Result;
            var tokenResult = (AuthTokenResultDTO)okResult.Value;
            Assert.AreEqual("someToken", tokenResult.AccessToken);
            Assert.AreEqual("newRawRefreshToken", tokenResult.RefreshToken);
            _tokenServiceMock.Verify(x => x.GetPrincipalFromExpiredToken("expiredAccessToken", "SomeKey", "SomeIssuer"), Times.Once);
            _refreshTokenServiceMock.Verify(x => x.ValidateRefreshTokenAsync("validRefreshToken", 2), Times.Once);
            _refreshTokenServiceMock.Verify(x => x.RevokeAndReplaceAsync(existingToken, 2), Times.Once);
        }

        [TestMethod]
        public async Task Should_Return_Unauthorized_From_Refresh_When_Token_Invalid()
        {
            //ARRANGE
            var principal = new ClaimsPrincipal(new ClaimsIdentity(new[]
            {
                new Claim("UserID", "2"),
                new Claim(ClaimTypes.Name, "Spock")
            }));

            _tokenServiceMock
                .Setup(x => x.GetPrincipalFromExpiredToken(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()))
                .Returns(principal);

            _refreshTokenServiceMock
                .Setup(x => x.ValidateRefreshTokenAsync(It.IsAny<string>(), 2))
                .ReturnsAsync((RefreshToken?)null);

            var request = new RefreshTokenRequestDTO
            {
                AccessToken = "expiredAccessToken",
                RefreshToken = "invalidRefreshToken"
            };

            //ACT
            var result = await _sut.Refresh(request);

            //ASSERT
            Assert.IsInstanceOfType(result.Result, typeof(UnauthorizedResult));
        }

        [TestMethod]
        public async Task Should_Return_Unauthorized_From_Refresh_When_Access_Token_Cannot_Be_Parsed()
        {
            //ARRANGE
            _tokenServiceMock
                .Setup(x => x.GetPrincipalFromExpiredToken(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()))
                .Returns((ClaimsPrincipal?)null);

            var request = new RefreshTokenRequestDTO
            {
                AccessToken = "totallyBogusToken",
                RefreshToken = "someRefreshToken"
            };

            //ACT
            var result = await _sut.Refresh(request);

            //ASSERT
            Assert.IsInstanceOfType(result.Result, typeof(UnauthorizedResult));
        }

        [TestMethod]
        public async Task Should_Revoke_Tokens()
        {
            //ARRANGE
            SetupUser(_sut);

            //ACT
            var result = await _sut.Revoke();

            //ASSERT
            Assert.IsInstanceOfType(result, typeof(NoContentResult));
            _refreshTokenServiceMock.Verify(x => x.RevokeByUserIdAsync(1), Times.Once);
        }

        [TestMethod]
        public async Task Should_Change_User_Password()
        {
            //ARRANGE
            SetupUser(_sut);
            var request = new PasswordChangeRequest();
            request.CurrentPassword = "MyCurrentPassword";
            request.NewPassword = "MyNewPassword";

            //ACT
            var result = await _sut.ChangePassword(request);

            //ASSERT
            Assert.IsInstanceOfType(result, typeof(OkResult));
            _userServiceMock.Verify(x => x.ChangePasswordAsync(1, request.CurrentPassword, request.NewPassword), Times.Once);
            _refreshTokenServiceMock.Verify(x => x.RevokeByUserIdAsync(1), Times.Once);
        }

        [TestMethod]
        public async Task Should_Process_Password_Reset_Request()
        {
            //ARRANGE
            var request = new RequestPasswordResetRequest();
            request.EmailAddress = "jtkirk@ufp.gov";

            //ACT
            var result = await _sut.RequestPasswordReset(request);

            //ASSERT
            Assert.IsInstanceOfType(result, typeof(ActionResult<string>));
            var actionResult = (ActionResult<string>)result;
            var okObjectResult = (OkObjectResult)actionResult.Result;
            Assert.AreEqual((int)HttpStatusCode.OK, okObjectResult.StatusCode);
            Assert.AreEqual("someResetCode", okObjectResult.Value);
            _userServiceMock.Verify(x => x.RequestPasswordResetAsync(request.EmailAddress), Times.Once);
        }

        [TestMethod]
        public async Task Should_Reset_Password()
        {
            //ARRANGE
            var request = new PasswordResetRequest();
            request.ResetCode = "someRestCode";
            request.NewPassword = "SomeNewFancyPassword12323238834!!!*&^%";

            //ACT
            var result = await _sut.ResetPassword(request);

            //ASSERT
            Assert.IsInstanceOfType(result, typeof(OkResult));
            _userServiceMock.Verify(x => x.ResetPasswordAsync(request.ResetCode, request.NewPassword), Times.Once);
        }

        [TestMethod]
        public async Task Should_Validate_Password_Reset_Code()
        {
            var result = await _sut.ValidatePasswordResetCode("someResetCode");
            Assert.IsInstanceOfType(result, typeof(ActionResult<bool>));
            Assert.IsTrue((result as ActionResult<bool>).Value);
            _userServiceMock.Verify(x => x.ValidatePasswordResetCodeAsync("someResetCode"), Times.Once);
        }

        private IConfiguration GetConfiguration(bool useSimpleLogin)
        {
            //From https://stackoverflow.com/questions/55497800/populate-iconfiguration-for-unit-tests
            var myConfiguration = new Dictionary<string, string>
            {
                {"SimpleLogin", useSimpleLogin.ToString()},
                {"Jwt:Key", "SomeKey"},
                {"Jwt:Issuer", "SomeIssuer"},
                {"Jwt:AccessTokenLifetimeMinutes", "15"},
                {"Jwt:RefreshTokenLifetimeDays", "7"}
            };

            return new ConfigurationBuilder()
                .AddInMemoryCollection(myConfiguration)
                .Build();
        }
    }
}
