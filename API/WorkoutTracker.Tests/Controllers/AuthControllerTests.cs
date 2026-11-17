using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Infrastructure;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.Extensions.Configuration;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Reflection;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using WorkoutTracker.Application.Security.Interfaces;
using WorkoutTracker.Application.Users.Interfaces;
using WorkoutTracker.Application.Users.Models;
using WorkoutTracker.Domain.Users;
using WorkoutTracker.API.Auth;
using WorkoutTracker.API.Controllers;
using WorkoutTracker.API.Mappers;
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
        private Mock<IPasswordResetService> _passwordResetServiceMock;
        private IUserDTOMapper _userDTOMapper;
        private AuthController _sut;
        private List<User> _testUsers;

        [TestInitialize]
        public void Initialize()
        {
            _testUsers = new List<User>(2)
                {
                    new User { Id = 1, Name = "Kirk", HashedPassword = "oijosidjfsgd", Salt = "iunfidnfgfd" },
                    new User { Id = 2, Name = "Spock", HashedPassword = "njnfdgdfufgdf", Salt = " jsnkjnbfdf8" }
                };

            _userServiceMock = new Mock<IUserService>(MockBehavior.Strict);
            _userServiceMock
                .Setup(x => x.GetByNameAsync(It.IsAny<string>()))
                .ReturnsAsync((string name, CancellationToken _) => _testUsers.FirstOrDefault(u => u.Name == name));
            _userServiceMock
                .Setup(x => x.GetByIdAsync(It.IsAny<int>()))
                .ReturnsAsync((int id, CancellationToken _) => _testUsers.FirstOrDefault(u => u.Id == id));
            _userServiceMock
                .Setup(x => x.ChangePasswordAsync(It.IsAny<int>(), It.IsAny<string>(), It.IsAny<string>()))
                .Returns(Task.CompletedTask);

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

            _userDTOMapper = new UserDTOMapper();

            _passwordResetServiceMock = new Mock<IPasswordResetService>(MockBehavior.Strict);
            _passwordResetServiceMock
                .Setup(x => x.RequestResetEmailAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
                .Returns(Task.CompletedTask);

            _sut = CreateController();
        }

        private AuthController CreateController()
        {
            //ControllerBase.Problem() asks the request's services for a factory, and there are none in a unit test.
            var problemDetailsFactory = new Mock<ProblemDetailsFactory>();
            problemDetailsFactory
                .Setup(x => x.CreateProblemDetails(It.IsAny<HttpContext>(), It.IsAny<int?>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()))
                .Returns((HttpContext _, int? statusCode, string title, string type, string detail, string instance) =>
                    new ProblemDetails { Status = statusCode, Detail = detail });

            return new AuthController(_userServiceMock.Object, _tokenServiceMock.Object, _configuration, _cryptoServiceMock.Object, _refreshTokenServiceMock.Object, _userDTOMapper, _passwordResetServiceMock.Object, LoggerFactory)
            {
                ProblemDetailsFactory = problemDetailsFactory.Object
            };
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
            _userServiceMock.Verify(x => x.GetByNameAsync("Spock"), Times.Once);
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
            _sut = CreateController();

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
            _userServiceMock.Verify(x => x.GetByNameAsync("Spock"), Times.Once);
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
            _userServiceMock.Verify(x => x.GetByNameAsync("Bones"), Times.Once);
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
            _sut = CreateController();

            var credentials = new UserCredentialsDTO();
            credentials.Username = "Spock";
            credentials.Password = "Kolinahr123!!!";

            //ACT
            var result = await _sut.Login(credentials);

            //ASSERT
            Assert.IsInstanceOfType(result.Result, typeof(UnauthorizedResult));
            var unauthorizedResult = (UnauthorizedResult)result.Result;
            Assert.AreEqual((int)HttpStatusCode.Unauthorized, unauthorizedResult.StatusCode);
            _userServiceMock.Verify(x => x.GetByNameAsync("Spock"), Times.Once);
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
            _userServiceMock.Verify(x => x.GetByIdAsync(2), Times.Once);
        }

        [TestMethod]
        public async Task Should_Not_Log_In_A_Deactivated_User()
        {
            //ARRANGE: SimpleLogin is on in this configuration, which skips the password check, so this is the only barrier.
            _testUsers.Single(u => u.Name == "Spock").IsActive = false;
            var credentials = new UserCredentialsDTO { Username = "Spock" };

            //ACT
            var result = await _sut.Login(credentials);

            //ASSERT
            Assert.IsInstanceOfType(result.Result, typeof(UnauthorizedResult));
            _tokenServiceMock.Verify(x => x.BuildToken(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<User>(), It.IsAny<int>()), Times.Never);
            _refreshTokenServiceMock.Verify(x => x.GenerateRefreshTokenAsync(It.IsAny<int>()), Times.Never);
        }

        [TestMethod]
        public async Task Should_Not_Refresh_The_Session_Of_A_Deactivated_User()
        {
            //ARRANGE
            _testUsers.Single(u => u.Id == 2).IsActive = false;
            var principal = new ClaimsPrincipal(new ClaimsIdentity(new[] { new Claim("UserID", "2") }));
            _tokenServiceMock
                .Setup(x => x.GetPrincipalFromExpiredToken(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()))
                .Returns(principal);
            _refreshTokenServiceMock
                .Setup(x => x.ValidateRefreshTokenAsync(It.IsAny<string>(), 2))
                .ReturnsAsync(new RefreshToken { Id = 1, UserId = 2, IsRevoked = false });

            //ACT
            var result = await _sut.Refresh(new RefreshTokenRequestDTO { AccessToken = "expiredAccessToken", RefreshToken = "validRefreshToken" });

            //ASSERT
            Assert.IsInstanceOfType(result.Result, typeof(UnauthorizedResult));
            _refreshTokenServiceMock.Verify(x => x.RevokeAndReplaceAsync(It.IsAny<RefreshToken>(), It.IsAny<int>()), Times.Never);
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
        public async Task Should_Get_Profiles()
        {
            //ARRANGE
            var profiles = new List<UserProfile>
            {
                new UserProfile { PublicId = Guid.NewGuid(), Name = "Kirk" },
                new UserProfile { PublicId = Guid.NewGuid(), Name = "Spock" }
            };
            _userServiceMock.Setup(x => x.GetAllProfilesAsync()).ReturnsAsync(profiles);

            //ACT
            var result = await _sut.GetProfiles();

            //ASSERT
            Assert.IsNotNull(result);
            Assert.IsInstanceOfType(result.Result, typeof(OkObjectResult));
            var dtos = ((result.Result as OkObjectResult).Value as IEnumerable<UserProfileDTO>).ToList();
            Assert.AreEqual(2, dtos.Count);
            Assert.AreEqual(profiles[0].PublicId, dtos[0].PublicId);
            Assert.AreEqual(profiles[0].Name, dtos[0].Name);
            Assert.AreEqual(profiles[1].PublicId, dtos[1].PublicId);
            Assert.AreEqual(profiles[1].Name, dtos[1].Name);
            _userServiceMock.Verify(x => x.GetAllProfilesAsync(), Times.Once);
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

        //PASSWORD CHANGE AND RESET ///////////////////////////////////////////////

        [TestMethod]
        public async Task Should_Turn_The_Messages_Written_For_Users_Into_A_400_When_Changing_Password()
        {
            //ARRANGE
            SetupUser(_sut);
            _userServiceMock
                .Setup(x => x.ChangePasswordAsync(It.IsAny<int>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
                .ThrowsAsync(new ApplicationException("Current password is not correct."));

            //ACT
            var result = await _sut.ChangePassword(new PasswordChangeRequest { CurrentPassword = "wrong", NewPassword = "AnotherLongPassword1" });

            //ASSERT
            var objectResult = (ObjectResult)result;
            Assert.AreEqual(StatusCodes.Status400BadRequest, objectResult.StatusCode);
            Assert.AreEqual("Current password is not correct.", ((ProblemDetails)objectResult.Value).Detail);
        }

        [TestMethod]
        public async Task Should_Not_Echo_An_Unexpected_Exception_When_Changing_Password()
        {
            //ARRANGE
            SetupUser(_sut);
            _userServiceMock
                .Setup(x => x.ChangePasswordAsync(It.IsAny<int>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
                .ThrowsAsync(new InvalidOperationException("secret connection string details"));

            //ACT
            var result = await _sut.ChangePassword(new PasswordChangeRequest { CurrentPassword = "x", NewPassword = "AnotherLongPassword1" });

            //ASSERT
            var objectResult = (ObjectResult)result;
            Assert.AreEqual(StatusCodes.Status500InternalServerError, objectResult.StatusCode);
            Assert.IsFalse(((ProblemDetails)objectResult.Value).Detail?.Contains("secret") ?? false);
        }

        [TestMethod]
        public async Task Should_Answer_A_Password_Reset_Request_With_An_Empty_204()
        {
            //ARRANGE
            var request = new RequestPasswordResetRequest { EmailAddress = "jtkirk@ufp.gov" };

            //ACT
            var result = await _sut.RequestPasswordReset(request);

            //ASSERT: no body at all, so there is nothing for a stranger to learn from it.
            Assert.IsInstanceOfType(result, typeof(NoContentResult));
            _passwordResetServiceMock.Verify(x => x.RequestResetEmailAsync("jtkirk@ufp.gov", It.IsAny<CancellationToken>()), Times.Once);
        }

        [TestMethod]
        [DataRow(true)]
        [DataRow(false)]
        public async Task Should_Say_Whether_A_Reset_Token_Is_Valid(bool isValid)
        {
            //ARRANGE
            _passwordResetServiceMock.Setup(x => x.ValidateTokenAsync("someToken", It.IsAny<CancellationToken>())).ReturnsAsync(isValid);

            //ACT
            var result = await _sut.ValidateResetToken(new ValidateResetTokenRequest { Token = "someToken" });

            //ASSERT
            var ok = (OkObjectResult)result.Result;
            Assert.AreEqual(isValid, ok.Value);
        }

        [TestMethod]
        public async Task Should_Reset_Password()
        {
            //ARRANGE
            _passwordResetServiceMock
                .Setup(x => x.ResetPasswordAsync("someToken", "SomeNewFancyPassword12323238834!!!*&^%", It.IsAny<CancellationToken>()))
                .ReturnsAsync(new PasswordResetOutcome(PasswordResetResult.Done));

            //ACT
            var result = await _sut.ResetPassword(new PasswordResetRequest { Token = "someToken", NewPassword = "SomeNewFancyPassword12323238834!!!*&^%" });

            //ASSERT
            Assert.IsInstanceOfType(result, typeof(NoContentResult));
        }

        [TestMethod]
        public async Task Should_Show_The_Password_Rule_Message_When_The_New_Password_Is_Refused()
        {
            //ARRANGE
            _passwordResetServiceMock
                .Setup(x => x.ResetPasswordAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(new PasswordResetOutcome(PasswordResetResult.InvalidPassword, "The password must be at least 12 characters."));

            //ACT
            var result = await _sut.ResetPassword(new PasswordResetRequest { Token = "someToken", NewPassword = "short" });

            //ASSERT
            var objectResult = (ObjectResult)result;
            Assert.AreEqual(StatusCodes.Status400BadRequest, objectResult.StatusCode);
            Assert.AreEqual("The password must be at least 12 characters.", ((ProblemDetails)objectResult.Value).Detail);
        }

        [TestMethod]
        public async Task Should_Give_One_Generic_Answer_For_Any_Bad_Reset_Token()
        {
            //ARRANGE: the same answer whatever was wrong with the token (unknown, expired, used, user deactivated).
            _passwordResetServiceMock
                .Setup(x => x.ResetPasswordAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(new PasswordResetOutcome(PasswordResetResult.InvalidToken));

            //ACT
            var result = await _sut.ResetPassword(new PasswordResetRequest { Token = "someToken", NewPassword = "AnotherLongPassword1" });

            //ASSERT
            var objectResult = (ObjectResult)result;
            Assert.AreEqual(StatusCodes.Status400BadRequest, objectResult.StatusCode);
            Assert.AreEqual("This reset link is invalid or has expired.", ((ProblemDetails)objectResult.Value).Detail);
        }

        [TestMethod]
        public void Should_Rate_Limit_And_Allow_Anonymous_Access_To_The_Reset_Endpoints()
        {
            foreach (var name in new[] { nameof(AuthController.RequestPasswordReset), nameof(AuthController.ValidateResetToken), nameof(AuthController.ResetPassword) })
            {
                var method = typeof(AuthController).GetMethod(name);

                Assert.IsNotNull(method, name);
                Assert.AreEqual(1, method.GetCustomAttributes(typeof(AllowAnonymousAttribute), true).Length, name);

                var limit = method.GetCustomAttributes(typeof(EnableRateLimitingAttribute), true).Cast<EnableRateLimitingAttribute>().SingleOrDefault();
                Assert.IsNotNull(limit, $"{name} should be rate limited.");
                Assert.AreEqual("password-reset", limit.PolicyName);
            }
        }

        [TestMethod]
        public void Should_No_Longer_Offer_The_Old_Reset_Endpoints_That_Leaked_Codes()
        {
            //The old GET validate-reset-code/{code} (a guessing oracle that put the code in the URL) is gone.
            Assert.IsNull(typeof(AuthController).GetMethod("ValidatePasswordResetCode"));
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
