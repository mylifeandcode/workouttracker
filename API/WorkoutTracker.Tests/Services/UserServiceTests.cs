using Microsoft.Extensions.Logging;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using Shouldly;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
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
            _userRepositoryMock.Setup(mock => mock.AddAsync(It.IsAny<User>(), true)).ReturnsAsync((User user, bool save) => user);
            _userRepositoryMock.Setup(mock => mock.DeleteAsync(It.IsAny<int>())).Returns(Task.CompletedTask);
            _userRepositoryMock.Setup(mock => mock.UpdateAsync(It.IsAny<User>(), true)).ReturnsAsync((User user, bool save) => user);
            _userRepositoryMock.Setup(mock => mock.Get()).Returns(_users.AsAsyncQueryable());
            _userRepositoryMock.Setup(mock => mock.GetAsync(It.IsAny<int>())).ReturnsAsync(_users[0]);
            _userRepositoryMock.Setup(mock => mock.AnyAsync(It.IsAny<Expression<Func<User, bool>>>())).ReturnsAsync(false);

            _cryptoServiceMock = new Mock<ICryptoService>(MockBehavior.Strict);
            _cryptoServiceMock.Setup(x => x.ComputeHash(It.IsAny<string>(), It.IsAny<string>())).Returns("someHash");
            _cryptoServiceMock.Setup(x => x.GenerateSalt()).Returns("someSalt");
            _cryptoServiceMock.Setup(x => x.VerifyValuesMatch(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>())).Returns(true);
            _cryptoServiceMock.Setup(x => x.GeneratePasswordResetCode()).Returns("SomePasswordResetCode");

            _emailServiceMock = new Mock<IEmailService>(MockBehavior.Strict);
            _emailServiceMock.Setup(x => x.SendEmailAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>())).Returns(Task.CompletedTask);
            _emailServiceMock.SetupGet(x => x.IsEnabled).Returns(true);
            _emailServiceMock.Setup(x => x.Dispose());

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
        public async Task Should_Add_User()
        {
            //ARRANGE
            var user = new User();

            //ACT
            var result = await _sut.AddAsync(user);

            //ASSERT
            _userRepositoryMock.Verify(mock => mock.AddAsync(user, true), Times.Once);
            result.ShouldBeSameAs(user);
        }

        [TestMethod]
        public async Task Should_Create_User_As_Admin_When_No_Users_Exist()
        {
            //ARRANGE
            var user = new User();
            user.Role = UserRole.Standard;

            //ACT
            await _sut.AddAsync(user);

            //ASSERT
            _userRepositoryMock.Verify(mock => mock.AddAsync(It.Is<User>(x => x.Role == UserRole.Administrator), true), Times.Once);
        }

        [TestMethod]
        public async Task Should_Delete_User()
        {
            //ARRANGE
            int userId = 100;

            //ACT
            await _sut.DeleteAsync(userId);

            //ASSERT
            _userRepositoryMock.Verify(mock => mock.DeleteAsync(userId), Times.Once);
        }

        [TestMethod]
        public async Task Should_Update_User()
        {
            //ARRANGE
            var user = new User();

            //ACT
            var result = await _sut.UpdateAsync(user);

            //ASSERT
            _userRepositoryMock.Verify(mock => mock.UpdateAsync(user, true), Times.Once);
            result.ShouldBeSameAs(user);
        }

        [TestMethod]
        public async Task Should_Get_All_Users_Excluding_SYSTEM_User()
        {
            //ARRANGE

            //ACT
            var results = (await _sut.GetAllAsync()).ToList();

            //ASSERT
            results.Count.ShouldBe(_users.Count - 1);
            results.Any(user => user.Name.ToUpper() == "SYSTEM").ShouldBeFalse();
        }

        [TestMethod]
        public async Task Should_Change_Password()
        {
            //ARRANGE
            const string currentPassword = "MyOldPassword";
            const string newPassword = "MyNewPassword";

            //ACT
            await _sut.ChangePasswordAsync(1, currentPassword, newPassword);

            //ASSERT
            _userRepositoryMock.Verify(x => x.GetAsync(1), Times.Once);
            _cryptoServiceMock.Verify(x => x.VerifyValuesMatch(currentPassword, It.IsAny<string>(), "MySalt"), Times.Once);
            _cryptoServiceMock.Verify(x => x.ComputeHash(newPassword, "MySalt"), Times.Once);
            _userRepositoryMock.Verify(x => x.UpdateAsync(It.IsAny<User>(), true), Times.Once);
        }

        [TestMethod]
        public async Task Should_Throw_An_Exception_When_Trying_To_Change_Password_When_User_Not_Found()
        {
            //ARRANGE
            _userRepositoryMock.Setup(mock => mock.GetAsync(It.IsAny<int>())).ReturnsAsync((User)null);

            //ACT & ASSERT
            await Should.ThrowAsync<ApplicationException>(() =>
                _sut.ChangePasswordAsync(2, "blah", "garrrrr!"));
        }

        [TestMethod]
        public async Task Should_Throw_An_Exception_When_Trying_To_Change_Password_When_Current_Password_Is_Not_A_Match()
        {
            //ARRANGE
            _cryptoServiceMock.Setup(x => x.VerifyValuesMatch(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>())).Returns(false);

            //ACT & ASSERT
            await Should.ThrowAsync<ApplicationException>(() =>
                _sut.ChangePasswordAsync(3, "heeeeey", "yoooouuuu"));
        }

        [TestMethod]
        public async Task Should_Process_Password_Reset_Request()
        {
            //ARRANGE

            //ACT
            var resetCode = await _sut.RequestPasswordResetAsync("paul@here.com");

            //ASSERT
            Assert.IsNotNull(resetCode);
            _userRepositoryMock.Verify(x => x.UpdateAsync(It.Is<User>(user => user.PasswordResetCode == resetCode), true), Times.Once);
            _emailServiceMock.Verify(x =>
                x.SendEmailAsync(
                    "paul@here.com",
                    "noreply@workouttracker.com",
                    "Password Reset",
                    It.IsAny<string>()),
                Times.Once);
        }

        [TestMethod]
        public async Task Should_Reset_Password()
        {
            //ARRANGE
            const string resetCode = "SomePasswordResetCode";
            const string newPassword = "newPassword123987!&^";

            //ACT
            await _sut.ResetPasswordAsync(resetCode, newPassword);

            //ASSERT
            _cryptoServiceMock.Verify(x => x.ComputeHash(newPassword, "MySalt"), Times.Once);
            _userRepositoryMock.Verify(x =>
                x.UpdateAsync(
                    It.Is<User>(user => user.PasswordResetCode == null && user.HashedPassword == "someHash"), true), Times.Once);
        }

        [TestMethod]
        public async Task Should_Validate_Password_Reset_Code_True()
        {
            Assert.IsTrue(await _sut.ValidatePasswordResetCodeAsync("SomePasswordResetCode"));
        }

        [TestMethod]
        public async Task Should_Validate_Password_Reset_Code_False()
        {
            Assert.IsFalse(await _sut.ValidatePasswordResetCodeAsync("SomeNonExistentPasswordResetCode"));
        }
    }
}
