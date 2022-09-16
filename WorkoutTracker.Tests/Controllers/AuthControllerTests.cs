using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using System;
using System.Collections.Generic;
using System.Linq;
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
        //private Mock<IConfiguration> _configurationMock;
        private IConfiguration _configuration;
        private Mock<ICryptoService> _cryptoServiceMock;

        [TestInitialize]
        public void Initialize()
        {
            _userServiceMock = new Mock<IUserService>(MockBehavior.Strict);
            _tokenServiceMock = new Mock<ITokenService>(MockBehavior.Strict);
            _tokenServiceMock
                .Setup(x => x.BuildToken(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<User>()))
                .Returns("someToken");

            //From https://stackoverflow.com/questions/55497800/populate-iconfiguration-for-unit-tests
            var myConfiguration = new Dictionary<string, string>
            {
                {"SimpleLogin", "true"},
                {"Jwt:Key", "SomeKey"},
                {"Jwt:Issuer", "SomeIssuer"}
            };

            _configuration = new ConfigurationBuilder()
                .AddInMemoryCollection(myConfiguration)
                .Build();

            _cryptoServiceMock = new Mock<ICryptoService>(MockBehavior.Strict);
        }

        [TestMethod]
        public void Should_Log_User_In_Using_Simple_Login_When_User_Is_Found()
        {
            //ARRANGE
            _userServiceMock
                .Setup(x => x.GetAll())
                .Returns(new List<User>(2) { new User { Name = "Kirk" }, new User { Name = "Spock" } });

            var sut = new AuthController(_userServiceMock.Object, _tokenServiceMock.Object, _configuration, _cryptoServiceMock.Object);

            var credentials = new UserCredentialsDTO();
            credentials.Username = "Spock";

            //ACT
            var result = sut.Login(credentials);

            //ASSERT
            Assert.IsInstanceOfType(result, typeof(ContentResult));
            var contentResult = (ContentResult)result;
            Assert.AreEqual("someToken", contentResult.Content);
            Assert.AreEqual(200, contentResult.StatusCode);
            //TODO: Complete
        }
    }
}
