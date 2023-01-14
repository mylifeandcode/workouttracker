using Microsoft.Extensions.Logging;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using Shouldly;
using System;
using System.Collections.Generic;
using System.Linq;
using WorkoutTracker.Application.Security.Interfaces;
using WorkoutTracker.Application.Shared.Interfaces;
using WorkoutTracker.Application.Users.Services;
using WorkoutTracker.Domain.Users;
using WorkoutTracker.Repository;

namespace WorkoutTracker.Tests.Services
{
    [TestClass]
    public class UserServiceTests
    {
        private Mock<ICryptoService> _cryptoServiceMock;
        private Mock<IEmailService> _emailServiceMock;
        private Mock<IRepository<User>> _userRepositoryMock;
        private const string FRONT_END_PASSWORD_RESET_URL = "https://workouttracker.com/reset-password";
        private List<User> _users;
        private UserService _sut;
        private Mock<ILogger<UserService>> _loggerMock;

        public UserServiceTests()
        {
            _users = new List<User>(3);
            _users.Add(new User { Id = 1, Name = "Paul", HashedPassword = "krbIcgEUXWlOszntUzEHHTvSQy+ig63C", Salt = "MySalt", EmailAddress = "paul@here.com", PasswordResetCode = "SomePasswordResetCode" });
            _users.Add(new User { Id = 2, Name = "System", HashedPassword = "Huh?", Salt = "SomeSalt", EmailAddress = "blahblah@gmail.com", PasswordResetCode = null });
            _users.Add(new User { Id = 3, Name = "Frank", HashedPassword = "Garrrr!", Salt = "Yay!", EmailAddress = "gar@gar.com", PasswordResetCode = null });
        }

        [TestInitialize]
        public void Init()
        {
            _userRepositoryMock = new Mock<IRepository<User>>(MockBehavior.Strict);
            _userRepositoryMock.Setup(mock => mock.Add(It.IsAny<User>(), true)).Returns((User user, bool save) => user);
            _userRepositoryMock.Setup(mock => mock.Delete(It.IsAny<int>()));
            _userRepositoryMock.Setup(mock => mock.Update(It.IsAny<User>(), true)).Returns((User user, bool save) => user);
            _userRepositoryMock.Setup(mock => mock.Get()).Returns(_users.AsQueryable());
            _userRepositoryMock.Setup(mock => mock.Get(It.IsAny<int>())).Returns(_users[0]);

            _cryptoServiceMock = new Mock<ICryptoService>(MockBehavior.Strict);
            _cryptoServiceMock.Setup(x => x.ComputeHash(It.IsAny<string>(), It.IsAny<string>())).Returns("someHash");
            _cryptoServiceMock.Setup(x => x.GenerateSalt()).Returns("someSalt");
            _cryptoServiceMock.Setup(x => x.VerifyValuesMatch(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>())).Returns(true);
            _cryptoServiceMock.Setup(x => x.GeneratePasswordResetCode()).Returns("SomePasswordResetCode");

            _emailServiceMock = new Mock<IEmailService>(MockBehavior.Strict);
            _emailServiceMock.Setup(x => x.SendEmail(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()));
            _emailServiceMock.SetupGet(x => x.IsEnabled).Returns(true);

            _loggerMock = new Mock<ILogger<UserService>>(MockBehavior.Strict);
            _loggerMock.Setup(x => x.Log(
                It.IsAny<LogLevel>(),
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((o, t) => true),
                It.IsAny<Exception>(),
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()));

            _sut = new UserService(_userRepositoryMock.Object, _cryptoServiceMock.Object, _emailServiceMock.Object, _loggerMock.Object, FRONT_END_PASSWORD_RESET_URL);
        }

        [TestMethod]
        public void Should_Add_User()
        {
            //ARRANGE
            var user = new User();

            //ACT
            var result = _sut.Add(user);

            //ASSERT
            _userRepositoryMock.Verify(mock => mock.Add(user, true), Times.Once);
            result.ShouldBeSameAs(user);
        }

        [TestMethod]
        public void Should_Delete_User()
        {
            //ARRANGE
            int userId = 100;

            //ACT
            _sut.Delete(userId);

            //ASSERT
            _userRepositoryMock.Verify(mock => mock.Delete(userId), Times.Once);
        }

        [TestMethod]
        public void Should_Update_User()
        {
            //ARRANGE
            var user = new User();

            //ACT
            var result = _sut.Update(user);

            //ASSERT
            _userRepositoryMock.Verify(mock => mock.Update(user, true), Times.Once);
            result.ShouldBeSameAs(user);
        }

        [TestMethod]
        public void Should_Get_All_Users_Excluding_SYSTEM_User()
        {
            //ARRANGE

            //ACT
            var results = _sut.GetAll().ToList();

            //ASSERT
            results.Count.ShouldBe(_users.Count - 1);
            results.Any(user =>
                    //user.Name.ToUpper(System.Globalization.CultureInfo.CurrentCulture) == "SYSTEM")
                    //EF doesn't like the culture stuff! :/                    
                    user.Name.ToUpper() == "SYSTEM")
                .ShouldBeFalse();
        }

        [TestMethod]
        public void Should_Change_Password()
        {
            //ARRANGE
            const string currentPassword = "MyOldPassword";
            const string newPassword = "MyNewPassword";

            //ACT
            _sut.ChangePassword(1, currentPassword, newPassword);

            //ASSERT
            _userRepositoryMock.Verify(x => x.Get(1), Times.Once);
            _cryptoServiceMock.Verify(x => x.VerifyValuesMatch(currentPassword, It.IsAny<string>(), "MySalt"), Times.Once);
            _cryptoServiceMock.Verify(x => x.ComputeHash(newPassword, "MySalt"), Times.Once);
            _userRepositoryMock.Verify(x => x.Update(It.IsAny<User>(), true), Times.Once);
        }

        [TestMethod, ExpectedException(typeof(ApplicationException))]
        public void Should_Throw_An_Exception_When_Trying_To_Change_Password_When_User_Not_Found()
        {
            //ARRANGE
            _userRepositoryMock.Setup(mock => mock.Get(It.IsAny<int>())).Returns((User)null);

            //ACT
            _sut.ChangePassword(2, "blah", "garrrrr!");

            //ASSERT
            //We never get here due to the exception. Maybe refactor someday to catch the exception and verify these.
            /*
            _userRepositoryMock.Verify(x => x.Get(2), Times.Once);
            _cryptoServiceMock.Verify(x => x.VerifyValuesMatch(It.IsAny<string>(), It.IsAny<string>(), "MySalt"), Times.Never);
            _cryptoServiceMock.Verify(x => x.ComputeHash(It.IsAny<string>(), "MySalt"), Times.Never);
            _userRepositoryMock.Verify(x => x.Update(It.IsAny<User>(), true), Times.Never);
            */
        }

        [TestMethod, ExpectedException(typeof(ApplicationException))]
        public void Should_Throw_An_Exception_When_Trying_To_Change_Password_When_Current_Password_Is_Not_A_Match()
        {
            //ARRANGE
            _cryptoServiceMock.Setup(x => x.VerifyValuesMatch(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>())).Returns(false);

            //ACT
            _sut.ChangePassword(3, "heeeeey", "yoooouuuu");

            //ASSERT
            //We never get here due to the exception. Maybe refactor someday to catch the exception and verify these.
            /*
            _userRepositoryMock.Verify(x => x.Get(2), Times.Once);
            _cryptoServiceMock.Verify(x => x.VerifyValuesMatch(It.IsAny<string>(), It.IsAny<string>(), "MySalt"), Times.Never);
            _cryptoServiceMock.Verify(x => x.ComputeHash(It.IsAny<string>(), "MySalt"), Times.Never);
            _userRepositoryMock.Verify(x => x.Update(It.IsAny<User>(), true), Times.Never);
            */
        }

        [TestMethod]
        public void Should_Process_Password_Reset_Request()
        {
            //ARRANGE

            //ACT
            var resetCode = _sut.RequestPasswordReset("paul@here.com");

            //ASSERT
            Assert.IsNotNull(resetCode);
            _userRepositoryMock.Verify(x => x.Update(It.Is<User>(user => user.PasswordResetCode == resetCode), true), Times.Once);
            _emailServiceMock.Verify(x => 
                x.SendEmail(
                    "paul@here.com", 
                    "noreply@workouttracker.com", 
                    "Password Reset", 
                    It.IsAny<string>()), 
                Times.Once);
        }

        [TestMethod]
        public void Should_Reset_Password()
        {
            //ARRANGE
            const string resetCode = "SomePasswordResetCode";
            const string newPassword = "newPassword123987!&^";

            //ACT
            _sut.ResetPassword(resetCode, newPassword);

            //ASSERT
            _cryptoServiceMock.Verify(x => x.ComputeHash(newPassword, "MySalt"), Times.Once);
            _userRepositoryMock.Verify(x =>
                x.Update(
                    It.Is<User>(user => user.PasswordResetCode == null && user.HashedPassword == "someHash"), true), Times.Once);
        }

        [TestMethod]
        public void Should_Validate_Password_Reset_Code_True()
        {
            Assert.IsTrue(_sut.ValidatePasswordResetCode("SomePasswordResetCode"));
        }

        [TestMethod]
        public void Should_Validate_Password_Reset_Code_False()
        {
            Assert.IsFalse(_sut.ValidatePasswordResetCode("SomeNonExistentPasswordResetCode"));
        }
    }
}
