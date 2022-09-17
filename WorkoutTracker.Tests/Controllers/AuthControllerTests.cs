using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;
using WorkoutTracker.Application.Security.Interfaces;
using WorkoutTracker.Application.Users.Interfaces;
using WorkoutTracker.Domain.Users;
using WorkoutTracker.UI.Auth;
using WorkoutTracker.UI.Controllers;
using WorkoutTracker.UI.Models;

namespace WorkoutTracker.Tests.Controllers
{
    [TestClass]
    public class AuthControllerTests : UserAwareControllerTestsBase
    {
        private Mock<IUserService> _userServiceMock;
        private Mock<ITokenService> _tokenServiceMock;
        private IConfiguration _configuration;
        private Mock<ICryptoService> _cryptoServiceMock;
        private AuthController _sut;

        [TestInitialize]
        public void Initialize()
        {
            _userServiceMock = new Mock<IUserService>(MockBehavior.Strict);
            _userServiceMock
                .Setup(x => x.GetAll())
                .Returns(new List<User>(2) 
                    { 
                        new User { Name = "Kirk", HashedPassword = "oijosidjfsgd", Salt = "iunfidnfgfd" }, 
                        new User { Name = "Spock", HashedPassword = "njnfdgdfufgdf", Salt = " jsnkjnbfdf8" } 
                    });
            _userServiceMock
                .Setup(x => x.ChangePassword(It.IsAny<int>(), It.IsAny<string>(), It.IsAny<string>()));
            _userServiceMock
                .Setup(x => x.RequestPasswordReset(It.IsAny<string>()))
                .Returns("someResetCode");
            _userServiceMock
                .Setup(x => x.ResetPassword(It.IsAny<string>(), It.IsAny<string>()));
            _userServiceMock
                .Setup(x => x.ValidatePasswordResetCode(It.IsAny<string>()))
                .Returns(true);

            _tokenServiceMock = new Mock<ITokenService>(MockBehavior.Strict);
            _tokenServiceMock
                .Setup(x => x.BuildToken(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<User>()))
                .Returns("someToken");

            _configuration = GetConfiguration(true);

            _cryptoServiceMock = new Mock<ICryptoService>(MockBehavior.Strict);
            _cryptoServiceMock
                .Setup(x => x.VerifyValuesMatch(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()))
                .Returns(true);

            _sut = new AuthController(_userServiceMock.Object, _tokenServiceMock.Object, _configuration, _cryptoServiceMock.Object);
        }

        [TestMethod]
        public void Should_Log_User_In_Using_Simple_Login_When_User_Is_Found()
        {
            //ARRANGE
            var credentials = new UserCredentialsDTO();
            credentials.Username = "Spock";

            //ACT
            var result = _sut.Login(credentials);

            //ASSERT
            Assert.IsInstanceOfType(result, typeof(ContentResult));
            var contentResult = (ContentResult)result;
            Assert.AreEqual("someToken", contentResult.Content);
            Assert.AreEqual(200, contentResult.StatusCode);
            _userServiceMock.Verify(x => x.GetAll(), Times.Once);
            _cryptoServiceMock.Verify(x => x.VerifyValuesMatch(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()), Times.Never);
            _tokenServiceMock.Verify(x => x.BuildToken("SomeKey", "SomeIssuer", It.IsAny<User>()), Times.Once);
        }

        [TestMethod]
        public void Should_Log_User_In_Using_Normal_Login_When_User_Is_Found()
        {
            //ARRANGE
            _configuration = GetConfiguration(false);

            //TODO: Troubleshoot. The updated config doesn't take unless I recreate the controller.
            _sut = new AuthController(_userServiceMock.Object, _tokenServiceMock.Object, _configuration, _cryptoServiceMock.Object);

            var credentials = new UserCredentialsDTO();
            credentials.Username = "Spock";

            //ACT
            var result = _sut.Login(credentials);

            //ASSERT
            Assert.IsInstanceOfType(result, typeof(ContentResult));
            var contentResult = (ContentResult)result;
            Assert.AreEqual("someToken", contentResult.Content);
            Assert.AreEqual(200, contentResult.StatusCode);
            _userServiceMock.Verify(x => x.GetAll(), Times.Once);
            _cryptoServiceMock.Verify(x => x.VerifyValuesMatch(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()), Times.Once);
            _tokenServiceMock.Verify(x => x.BuildToken("SomeKey", "SomeIssuer", It.IsAny<User>()), Times.Once);
        }

        [TestMethod]
        public void Should_Return_Not_Found_Result_From_Login_When_User_Not_Found()
        {
            //ARRANGE
            var credentials = new UserCredentialsDTO();
            credentials.Username = "Bones";

            //ACT
            var result = _sut.Login(credentials);

            //ASSERT
            Assert.IsInstanceOfType(result, typeof(NotFoundResult));
            var notFoundResult = (NotFoundResult)result;
            Assert.AreEqual((int)HttpStatusCode.NotFound, notFoundResult.StatusCode); //Kind of redundant
            _userServiceMock.Verify(x => x.GetAll(), Times.Once);
            _cryptoServiceMock.Verify(x => x.VerifyValuesMatch(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()), Times.Never);
            _tokenServiceMock.Verify(x => x.BuildToken("SomeKey", "SomeIssuer", It.IsAny<User>()), Times.Never);
        }

        [TestMethod]
        public void Should_Return_UnauthorizedResult_From_Login_When_Credentials_Are_Incorrect()
        {
            //ARRANGE
            _configuration = GetConfiguration(false);
            _cryptoServiceMock
                .Setup(x => x.VerifyValuesMatch(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()))
                .Returns(false);

            //TODO: Troubleshoot. The updated config doesn't take unless I recreate the controller.
            _sut = new AuthController(_userServiceMock.Object, _tokenServiceMock.Object, _configuration, _cryptoServiceMock.Object);

            var credentials = new UserCredentialsDTO();
            credentials.Username = "Spock";
            credentials.Password = "Kolinahr123!!!";

            //ACT
            var result = _sut.Login(credentials);

            //ASSERT
            Assert.IsInstanceOfType(result, typeof(UnauthorizedResult));
            var unauthorizedResult = (UnauthorizedResult)result;
            Assert.AreEqual((int)HttpStatusCode.Unauthorized, unauthorizedResult.StatusCode); //Kind of redundant
            _userServiceMock.Verify(x => x.GetAll(), Times.Once);
            _cryptoServiceMock.Verify(x => x.VerifyValuesMatch(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()), Times.Once);
            _tokenServiceMock.Verify(x => x.BuildToken("SomeKey", "SomeIssuer", It.IsAny<User>()), Times.Never);
        }

        [TestMethod]
        public void Should_Change_User_Password()
        {
            //ARRANGE
            SetupUser(_sut);
            var request = new PasswordChangeRequest();
            request.CurrentPassword = "MyCurrentPassword";
            request.NewPassword = "MyNewPassword";

            //ACT
            var result = _sut.ChangePassword(request);

            //ASSERT
            Assert.IsInstanceOfType(result, typeof(OkResult));
            _userServiceMock.Verify(x => x.ChangePassword(1, request.CurrentPassword, request.NewPassword), Times.Once);
        }

        [TestMethod]
        public void Should_Process_Password_Reset_Request()
        {
            //ARRANGE
            var request = new RequestPasswordResetRequest();
            request.EmailAddress = "jtkirk@ufp.gov";

            //ACT
            var result = _sut.RequestPasswordReset(request);

            //ASSERT
            Assert.IsInstanceOfType(result, typeof(ActionResult<string>));
            var actionResult = (ActionResult<string>)result;
            var okObjectResult = (OkObjectResult)actionResult.Result;
            Assert.AreEqual((int)HttpStatusCode.OK, okObjectResult.StatusCode); //Kind of redundant
            Assert.AreEqual("someResetCode", okObjectResult.Value);
            _userServiceMock.Verify(x => x.RequestPasswordReset(request.EmailAddress), Times.Once);
        }

        [TestMethod]
        public void Should_Reset_Password()
        {
            //ARRANGE
            var request = new PasswordResetRequest();
            request.ResetCode = "someRestCode";
            request.NewPassword = "SomeNewFancyPassword12323238834!!!*&^%";

            //ACT
            var result = _sut.ResetPassword(request);

            //ASSERT
            Assert.IsInstanceOfType(result, typeof(OkResult));
            _userServiceMock.Verify(x => x.ResetPassword(request.ResetCode, request.NewPassword), Times.Once);
        }

        [TestMethod]
        public void Should_Validate_Password_Reset_Code()
        {
            var result = _sut.ValidatePasswordResetCode("someResetCode");
            Assert.IsInstanceOfType(result, typeof(ActionResult<bool>));
            Assert.IsTrue((result as ActionResult<bool>).Value);
            _userServiceMock.Verify(x => x.ValidatePasswordResetCode("someResetCode"), Times.Once);
        }

        private IConfiguration GetConfiguration(bool useSimpleLogin)
        {
            //From https://stackoverflow.com/questions/55497800/populate-iconfiguration-for-unit-tests
            var myConfiguration = new Dictionary<string, string>
            {
                {"SimpleLogin", useSimpleLogin.ToString()},
                {"Jwt:Key", "SomeKey"},
                {"Jwt:Issuer", "SomeIssuer"}
            };

            return new ConfigurationBuilder()
                .AddInMemoryCollection(myConfiguration)
                .Build();
        }
    }
}
