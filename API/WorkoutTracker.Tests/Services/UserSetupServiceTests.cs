using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using Shouldly;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;
using WorkoutTracker.Application.Security.Interfaces;
using WorkoutTracker.Application.Users.Models;
using WorkoutTracker.Application.Users.Services;
using WorkoutTracker.Domain.Users;
using WorkoutTracker.Repository;

namespace WorkoutTracker.Tests.Services
{
    [TestClass]
    public class UserSetupServiceTests
    {
        private const string VALID_PASSWORD = "a-long-enough-password";

        private List<User> _users;
        private List<string> _announcements;
        private Mock<IRepository<User>> _userRepositoryMock;
        private Mock<ICryptoService> _cryptoServiceMock;
        private SetupCodeProvider _setupCodeProvider;
        private UserSetupService _sut;
        private TimeSpan _addDelay;

        [TestInitialize]
        public void Initialize()
        {
            //EnsureSeedData always creates the hidden SYSTEM user, so a "fresh" system still has one user.
            _users = new List<User> { new User { Id = 1, Name = "SYSTEM" } };
            _announcements = new List<string>();
            _addDelay = TimeSpan.Zero;

            //The predicate is really evaluated, so the SYSTEM exclusion is exercised rather than assumed.
            _userRepositoryMock = new Mock<IRepository<User>>(MockBehavior.Strict);
            _userRepositoryMock
                .Setup(mock => mock.AnyAsync(It.IsAny<Expression<Func<User, bool>>>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync((Expression<Func<User, bool>> predicate, CancellationToken _) => _users.Any(predicate.Compile()));
            _userRepositoryMock
                .Setup(mock => mock.AddAsync(It.IsAny<User>(), true, It.IsAny<CancellationToken>()))
                .Returns(async (User user, bool save, CancellationToken _) =>
                {
                    if (_addDelay > TimeSpan.Zero) await Task.Delay(_addDelay);
                    _users.Add(user);
                    return user;
                });

            _cryptoServiceMock = new Mock<ICryptoService>(MockBehavior.Strict);
            _cryptoServiceMock.Setup(x => x.GenerateSalt()).Returns("someSalt");
            _cryptoServiceMock.Setup(x => x.ComputeHash(It.IsAny<string>(), It.IsAny<string>())).Returns("someHash");

            _setupCodeProvider = new SetupCodeProvider(null, message => _announcements.Add(message));

            _sut = new UserSetupService(_userRepositoryMock.Object, _cryptoServiceMock.Object, _setupCodeProvider, NullLogger<UserSetupService>.Instance);
        }

        private async Task<string> GetSetupCodeAsync()
        {
            (await _sut.IsSetupRequiredAsync()).ShouldBeTrue();
            return Regex.Match(_announcements[^1], "[0-9A-HJKMNP-TV-Z]{4}(?:-[0-9A-HJKMNP-TV-Z]{4}){3}").Value;
        }

        [TestMethod]
        public async Task Should_Require_Setup_When_Only_The_System_User_Exists()
        {
            //ACT
            var result = await _sut.IsSetupRequiredAsync();

            //ASSERT
            result.ShouldBeTrue();
            _announcements.Count.ShouldBe(1);
        }

        [TestMethod]
        public async Task Should_Not_Require_Setup_When_A_User_Exists_And_Should_Deactivate_The_Code()
        {
            //ARRANGE
            var code = await GetSetupCodeAsync();
            _users.Add(new User { Id = 2, Name = "Alice" });

            //ACT
            var result = await _sut.IsSetupRequiredAsync();

            //ASSERT
            result.ShouldBeFalse();
            _setupCodeProvider.Check(code).ShouldBe(SetupCodeResult.Invalid);
        }

        [TestMethod]
        public async Task Should_Create_An_Administrator_With_The_Right_Code()
        {
            //ARRANGE
            var code = await GetSetupCodeAsync();

            //ACT
            var outcome = await _sut.CreateFirstAdministratorAsync("  Alice  ", " alice@here.com ", VALID_PASSWORD, code);

            //ASSERT
            outcome.Status.ShouldBe(FirstAdminStatus.Created);
            var created = _users.Single(x => x.Name == "Alice");
            created.Role.ShouldBe(UserRole.Administrator);
            created.EmailAddress.ShouldBe("alice@here.com");
            created.Salt.ShouldBe("someSalt");
            created.HashedPassword.ShouldBe("someHash");
            created.Settings.RepSettings.ShouldNotBeEmpty();
            _cryptoServiceMock.Verify(x => x.ComputeHash(VALID_PASSWORD, "someSalt"), Times.Once);
        }

        [TestMethod]
        public async Task Should_Not_Allow_The_Code_To_Be_Used_Twice()
        {
            //ARRANGE
            var code = await GetSetupCodeAsync();
            await _sut.CreateFirstAdministratorAsync("Alice", "alice@here.com", VALID_PASSWORD, code);

            //ACT
            var outcome = await _sut.CreateFirstAdministratorAsync("Mallory", "mallory@here.com", VALID_PASSWORD, code);

            //ASSERT
            outcome.Status.ShouldBe(FirstAdminStatus.AlreadySetUp);
            _users.Any(x => x.Name == "Mallory").ShouldBeFalse();
        }

        [TestMethod]
        public async Task Should_Refuse_When_A_User_Already_Exists()
        {
            //ARRANGE
            var code = await GetSetupCodeAsync();
            _users.Add(new User { Id = 2, Name = "Alice" });

            //ACT
            var outcome = await _sut.CreateFirstAdministratorAsync("Mallory", "mallory@here.com", VALID_PASSWORD, code);

            //ASSERT
            outcome.Status.ShouldBe(FirstAdminStatus.AlreadySetUp);
            _userRepositoryMock.Verify(mock => mock.AddAsync(It.IsAny<User>(), true, It.IsAny<CancellationToken>()), Times.Never);
        }

        [TestMethod]
        public async Task Should_Refuse_A_Wrong_Setup_Code()
        {
            //ARRANGE
            await GetSetupCodeAsync();

            //ACT
            var outcome = await _sut.CreateFirstAdministratorAsync("Mallory", "mallory@here.com", VALID_PASSWORD, "ZZZZ-ZZZZ-ZZZZ-ZZZZ");

            //ASSERT
            outcome.Status.ShouldBe(FirstAdminStatus.InvalidCode);
            _users.Count.ShouldBe(1);
        }

        [TestMethod]
        public async Task Should_Report_A_Lockout_After_Too_Many_Wrong_Codes_And_Create_Nobody()
        {
            //ARRANGE: a configured code is locked out (rather than replaced) after too many wrong guesses.
            const string configuredCode = "my-configured-setup-code";
            var sut = new UserSetupService(
                _userRepositoryMock.Object,
                _cryptoServiceMock.Object,
                new SetupCodeProvider(configuredCode, message => _announcements.Add(message)),
                NullLogger<UserSetupService>.Instance);

            for (var i = 0; i < SetupCodeProvider.MaxFailedAttempts; i++)
            {
                var wrongGuess = await sut.CreateFirstAdministratorAsync("Mallory", "mallory@here.com", VALID_PASSWORD, "wrong");
                wrongGuess.Status.ShouldBe(FirstAdminStatus.InvalidCode);
            }

            //ACT: even the right code is refused now.
            var outcome = await sut.CreateFirstAdministratorAsync("Alice", "alice@here.com", VALID_PASSWORD, configuredCode);

            //ASSERT
            outcome.Status.ShouldBe(FirstAdminStatus.LockedOut);
            _users.Count.ShouldBe(1);
        }

        [TestMethod]
        public async Task Should_Show_The_Operator_A_Code_Even_If_Status_Was_Never_Requested()
        {
            //ACT
            var outcome = await _sut.CreateFirstAdministratorAsync("Mallory", "mallory@here.com", VALID_PASSWORD, "guess");

            //ASSERT
            outcome.Status.ShouldBe(FirstAdminStatus.InvalidCode);
            _announcements.Count.ShouldBe(1);
        }

        [TestMethod]
        [DataRow("", "alice@here.com", VALID_PASSWORD)]
        [DataRow("   ", "alice@here.com", VALID_PASSWORD)]
        [DataRow("SYSTEM", "alice@here.com", VALID_PASSWORD)]
        [DataRow(" system ", "alice@here.com", VALID_PASSWORD)]
        [DataRow("Alice", "", VALID_PASSWORD)]
        [DataRow("Alice", "not-an-email", VALID_PASSWORD)]
        [DataRow("Alice", "alice@here.com", "")]
        [DataRow("Alice", "alice@here.com", "short")]
        public async Task Should_Refuse_Invalid_Input_Without_Using_Up_The_Code(string userName, string email, string password)
        {
            //ARRANGE
            var code = await GetSetupCodeAsync();

            //ACT
            var outcome = await _sut.CreateFirstAdministratorAsync(userName, email, password, code);

            //ASSERT
            outcome.Status.ShouldBe(FirstAdminStatus.InvalidInput);
            outcome.Message.ShouldNotBeNullOrEmpty();
            _users.Count.ShouldBe(1);
            _setupCodeProvider.Check(code).ShouldBe(SetupCodeResult.Valid);
        }

        [TestMethod]
        public async Task Should_Create_Exactly_One_Administrator_When_Called_Concurrently()
        {
            //ARRANGE
            var code = await GetSetupCodeAsync();
            _addDelay = TimeSpan.FromMilliseconds(100);

            //ACT
            var outcomes = await Task.WhenAll(
                Enumerable.Range(0, 5).Select(i =>
                    Task.Run(() => _sut.CreateFirstAdministratorAsync($"User{i}", $"user{i}@here.com", VALID_PASSWORD, code))));

            //ASSERT
            outcomes.Count(x => x.Status == FirstAdminStatus.Created).ShouldBe(1);
            outcomes.Count(x => x.Status == FirstAdminStatus.AlreadySetUp).ShouldBe(4);
            _users.Count(x => x.Name != "SYSTEM").ShouldBe(1);
        }
    }
}
