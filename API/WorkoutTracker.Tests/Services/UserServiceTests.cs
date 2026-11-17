using Microsoft.Extensions.Logging;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using Shouldly;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading;
using System.Threading.Tasks;
using WorkoutTracker.Application.Security.Interfaces;
using WorkoutTracker.Application.Shared.Interfaces;
using WorkoutTracker.Application.Users.Models;
using WorkoutTracker.Application.Users.Services;
using WorkoutTracker.Domain.Users;
using WorkoutTracker.Repository;

namespace WorkoutTracker.Tests.Services
{
    [TestClass]
    public class UserServiceTests
    {
        private Mock<ICryptoService> _cryptoServiceMock;
        private Mock<IRefreshTokenService> _refreshTokenServiceMock;
        private Mock<IRepository<User>> _userRepositoryMock;
        private List<User> _users;
        private UserService _sut;
        private Mock<ILogger<UserService>> _loggerMock;

        public UserServiceTests()
        {
            _users = new List<User>(3);
            _users.Add(new User { Id = 1, Name = "Paul", HashedPassword = "krbIcgEUXWlOszntUzEHHTvSQy+ig63C", Salt = "MySalt", EmailAddress = "paul@here.com" });
            _users.Add(new User { Id = 2, Name = "SYSTEM", HashedPassword = "Huh?", Salt = "SomeSalt", EmailAddress = "blahblah@gmail.com" });
            _users.Add(new User { Id = 3, Name = "Frank", HashedPassword = "Garrrr!", Salt = "Yay!", EmailAddress = "gar@gar.com" });
        }

        [TestInitialize]
        public void Init()
        {
            _userRepositoryMock = new Mock<IRepository<User>>(MockBehavior.Strict);
            _userRepositoryMock.Setup(mock => mock.AddAsync(It.IsAny<User>(), true)).ReturnsAsync((User user, bool save, CancellationToken _) => user);
            _userRepositoryMock.Setup(mock => mock.DeleteAsync(It.IsAny<int>())).Returns(Task.CompletedTask);
            _userRepositoryMock.Setup(mock => mock.UpdateAsync(It.IsAny<User>(), true)).ReturnsAsync((User user, bool save, CancellationToken _) => user);
            _userRepositoryMock.Setup(mock => mock.Get()).Returns(_users.AsAsyncQueryable());
            _userRepositoryMock.Setup(mock => mock.GetWithoutTracking()).Returns(_users.AsAsyncQueryable());
            _userRepositoryMock.Setup(mock => mock.GetAsync(It.IsAny<int>())).ReturnsAsync(_users[0]);
            _userRepositoryMock.Setup(mock => mock.AnyAsync(It.IsAny<Expression<Func<User, bool>>>())).ReturnsAsync(false);

            _cryptoServiceMock = new Mock<ICryptoService>(MockBehavior.Strict);
            _cryptoServiceMock.Setup(x => x.ComputeHash(It.IsAny<string>(), It.IsAny<string>())).Returns("someHash");
            _cryptoServiceMock.Setup(x => x.GenerateSalt()).Returns("someSalt");
            _cryptoServiceMock.Setup(x => x.VerifyValuesMatch(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>())).Returns(true);


            _loggerMock = new Mock<ILogger<UserService>>(MockBehavior.Strict);
            _loggerMock.Setup(x => x.Log(
                It.IsAny<LogLevel>(),
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((o, t) => true),
                It.IsAny<Exception>(),
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()));

            _refreshTokenServiceMock = new Mock<IRefreshTokenService>(MockBehavior.Strict);
            _refreshTokenServiceMock.Setup(x => x.RevokeByUserIdAsync(It.IsAny<int>(), It.IsAny<CancellationToken>())).Returns(Task.CompletedTask);

            _sut = new UserService(_userRepositoryMock.Object, _cryptoServiceMock.Object, _refreshTokenServiceMock.Object, _loggerMock.Object);
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
        public async Task Should_Not_Change_The_Role_Even_When_No_Users_Exist()
        {
            //ARRANGE
            //This used to promote the first user to Administrator. That now happens only through UserSetupService.
            var user = new User();
            user.Role = UserRole.Standard;

            //ACT
            await _sut.AddAsync(user);

            //ASSERT
            _userRepositoryMock.Verify(mock => mock.AddAsync(It.Is<User>(x => x.Role == UserRole.Standard), true), Times.Once);
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
        public async Task Should_Get_All_Profiles_Excluding_SYSTEM_User()
        {
            //ACT
            var results = (await _sut.GetAllProfilesAsync()).ToList();

            //ASSERT
            results.Count.ShouldBe(_users.Count - 1);
            results.Any(profile => profile.Name == "SYSTEM").ShouldBeFalse();
            results.Any(profile => profile.Name == "Paul").ShouldBeTrue();
        }

        [TestMethod]
        public async Task Should_Get_User_By_Name()
        {
            //ACT
            var result = await _sut.GetByNameAsync("Paul");

            //ASSERT
            result.ShouldNotBeNull();
            result.Id.ShouldBe(1);
        }

        [TestMethod]
        public async Task Should_Return_Null_From_GetByNameAsync_When_User_Not_Found()
        {
            //ACT
            var result = await _sut.GetByNameAsync("NoSuchUser");

            //ASSERT
            result.ShouldBeNull();
        }

        [TestMethod]
        public async Task Should_Not_Return_SYSTEM_User_From_GetByNameAsync()
        {
            //ACT
            var result = await _sut.GetByNameAsync("SYSTEM");

            //ASSERT
            result.ShouldBeNull();
        }

        [TestMethod]
        public async Task Should_Forward_CancellationToken_To_Repository_When_Getting_User_By_Name()
        {
            //ARRANGE
            var token = new CancellationTokenSource().Token;

            //ACT
            var result = await _sut.GetByNameAsync("Paul", token);

            //ASSERT — this only proves the token is accepted and passed through without breaking the
            //call; TestAsyncQueryProvider.ExecuteAsync ignores CancellationToken entirely, so it cannot
            //prove real cancellation actually stops the query (see TestAsyncQueryProvider.cs).
            result.ShouldNotBeNull();
            result.Id.ShouldBe(1);
        }

        [TestMethod]
        public async Task Should_Change_Password()
        {
            //ARRANGE
            const string currentPassword = "MyOldPassword";
            const string newPassword = "MyNewPassword-123";

            //ACT
            await _sut.ChangePasswordAsync(1, currentPassword, newPassword);

            //ASSERT
            _userRepositoryMock.Verify(x => x.GetAsync(1), Times.Once);
            _cryptoServiceMock.Verify(x => x.VerifyValuesMatch(currentPassword, It.IsAny<string>(), "MySalt"), Times.Once);
            //Hashed with a new salt, not the old one: the old salt belongs to the password being replaced.
            _cryptoServiceMock.Verify(x => x.ComputeHash(newPassword, "someSalt"), Times.Once);
            _userRepositoryMock.Verify(x => x.UpdateAsync(It.Is<User>(user => user.Salt == "someSalt" && user.HashedPassword == "someHash"), true), Times.Once);
        }

        [TestMethod]
        [DataRow("")]
        [DataRow("short")]
        [DataRow("elevenchars")]
        public async Task Should_Refuse_A_New_Password_That_Breaks_The_Password_Policy_When_Changing_Password(string newPassword)
        {
            //ACT & ASSERT: the message is meant to be shown to the user.
            var ex = await Should.ThrowAsync<ApplicationException>(() => _sut.ChangePasswordAsync(1, "MyOldPassword", newPassword));
            ex.Message.ShouldContain("at least 12 characters");
            _userRepositoryMock.Verify(x => x.UpdateAsync(It.IsAny<User>(), true), Times.Never);
        }

        [TestMethod]
        public async Task Should_Throw_An_Exception_When_Trying_To_Change_Password_When_User_Not_Found()
        {
            //ARRANGE
            _userRepositoryMock.Setup(mock => mock.GetAsync(It.IsAny<int>())).ReturnsAsync((User)null);

            //ACT & ASSERT
            await Should.ThrowAsync<ApplicationException>(() =>
                _sut.ChangePasswordAsync(2, "blah", "garrrrr-and-more!"));
        }

        [TestMethod]
        public async Task Should_Throw_An_Exception_When_Trying_To_Change_Password_When_Current_Password_Is_Not_A_Match()
        {
            //ARRANGE
            _cryptoServiceMock.Setup(x => x.VerifyValuesMatch(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>())).Returns(false);

            //ACT & ASSERT
            await Should.ThrowAsync<ApplicationException>(() =>
                _sut.ChangePasswordAsync(3, "heeeeey", "yoooouuuu-and-more"));
        }

        //ADMINISTRATION: PROFILE, SETTINGS, DEACTIVATION ///////////////////////////

        private const int ADMIN_ID = 1;
        private const int STANDARD_ID = 3;
        private const int SYSTEM_ID = 2;

        //Gives the repository a real AnyAsync (the default setup always says "no"), and makes Paul the one
        //administrator and Frank a standard user. SYSTEM is deliberately neither.
        private void SetupAdministrationScenario()
        {
            _userRepositoryMock
                .Setup(mock => mock.AnyAsync(It.IsAny<Expression<Func<User, bool>>>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync((Expression<Func<User, bool>> predicate, CancellationToken _) => _users.Any(predicate.Compile()));

            _users[0].Role = UserRole.Administrator;
            _users[2].Role = UserRole.Standard;
        }

        private User Paul => _users[0];
        private User Frank => _users[2];

        [TestMethod]
        public async Task Should_Report_Whether_A_User_Is_Active()
        {
            //ARRANGE
            SetupAdministrationScenario();
            Frank.IsActive = false;

            //ACT & ASSERT
            Assert.IsTrue(await _sut.IsActiveAsync(ADMIN_ID));
            Assert.IsFalse(await _sut.IsActiveAsync(STANDARD_ID));
            Assert.IsFalse(await _sut.IsActiveAsync(12345));
        }

        [TestMethod]
        public async Task Should_Leave_Deactivated_Users_Off_The_User_Picker()
        {
            //ARRANGE
            Frank.IsActive = false;

            //ACT
            var profiles = (await _sut.GetAllProfilesAsync()).ToList();

            //ASSERT
            profiles.Select(x => x.Name).ShouldBe(new[] { "Paul" });
        }

        [TestMethod]
        public async Task Should_Change_Only_Name_Email_And_Role_When_Updating_A_Profile()
        {
            //ARRANGE
            SetupAdministrationScenario();
            var salt = Frank.Salt;
            var hash = Frank.HashedPassword;
            var createdBy = Frank.CreatedByUserId;
            var created = Frank.CreatedDateTime;

            //ACT
            var outcome = await _sut.UpdateProfileAsync(Frank.PublicId, "  Franklin  ", " franklin@here.com ", UserRole.Administrator, ADMIN_ID);

            //ASSERT
            outcome.Result.ShouldBe(UserAdministrationResult.Done);
            Frank.Name.ShouldBe("Franklin");
            Frank.EmailAddress.ShouldBe("franklin@here.com");
            Frank.Role.ShouldBe(UserRole.Administrator);
            Frank.ModifiedByUserId.ShouldBe(ADMIN_ID);

            //The data the old Put wiped by binding the whole entity from the request:
            Frank.HashedPassword.ShouldBe(hash);
            Frank.Salt.ShouldBe(salt);
            Frank.CreatedByUserId.ShouldBe(createdBy);
            Frank.CreatedDateTime.ShouldBe(created);

            _userRepositoryMock.Verify(mock => mock.UpdateAsync(Frank, true), Times.Once);
        }

        [TestMethod]
        public async Task Should_Refuse_Admin_Operations_From_A_Caller_Who_Is_Not_An_Active_Administrator()
        {
            //ARRANGE
            SetupAdministrationScenario();

            //ACT & ASSERT: a standard user, a deactivated administrator, and someone who doesn't exist.
            var asStandard = await _sut.UpdateProfileAsync(Paul.PublicId, "Paul", "paul@here.com", UserRole.Administrator, STANDARD_ID);
            asStandard.Result.ShouldBe(UserAdministrationResult.NotPermitted);

            Paul.IsActive = false;
            var asDeactivatedAdmin = await _sut.DeactivateAsync(Frank.PublicId, ADMIN_ID);
            asDeactivatedAdmin.Result.ShouldBe(UserAdministrationResult.NotPermitted);

            var asNobody = await _sut.ReactivateAsync(Frank.PublicId, 12345);
            asNobody.Result.ShouldBe(UserAdministrationResult.NotPermitted);

            _userRepositoryMock.Verify(mock => mock.UpdateAsync(It.IsAny<User>(), true), Times.Never);
        }

        [TestMethod]
        public async Task Should_Not_Demote_The_Last_Administrator()
        {
            //ARRANGE
            SetupAdministrationScenario();

            //ACT
            var outcome = await _sut.UpdateProfileAsync(Paul.PublicId, "Paul", "paul@here.com", UserRole.Standard, ADMIN_ID);

            //ASSERT
            outcome.Result.ShouldBe(UserAdministrationResult.CannotRemoveLastAdministrator);
            Paul.Role.ShouldBe(UserRole.Administrator);
        }

        [TestMethod]
        public async Task Should_Demote_An_Administrator_When_Another_Active_One_Exists()
        {
            //ARRANGE
            SetupAdministrationScenario();
            Frank.Role = UserRole.Administrator;

            //ACT
            var outcome = await _sut.UpdateProfileAsync(Paul.PublicId, "Paul", "paul@here.com", UserRole.Standard, STANDARD_ID);

            //ASSERT
            outcome.Result.ShouldBe(UserAdministrationResult.Done);
            Paul.Role.ShouldBe(UserRole.Standard);
        }

        [TestMethod]
        [DataRow("", "a@b.co", UserRole.Standard)]
        [DataRow("   ", "a@b.co", UserRole.Standard)]
        [DataRow("SYSTEM", "a@b.co", UserRole.Standard)]
        [DataRow(" system ", "a@b.co", UserRole.Standard)]
        [DataRow("Frank", "", UserRole.Standard)]
        [DataRow("Frank", "not-an-email", UserRole.Standard)]
        [DataRow("Frank", "a@b.co", (UserRole)0)]
        [DataRow("Frank", "a@b.co", (UserRole)99)]
        public async Task Should_Refuse_Invalid_Profile_Input(string name, string email, UserRole role)
        {
            //ARRANGE
            SetupAdministrationScenario();

            //ACT
            var outcome = await _sut.UpdateProfileAsync(Frank.PublicId, name, email, role, ADMIN_ID);

            //ASSERT
            outcome.Result.ShouldBe(UserAdministrationResult.InvalidInput);
            outcome.Message.ShouldNotBeNullOrEmpty();
            Frank.Name.ShouldBe("Frank");
        }

        [TestMethod]
        public async Task Should_Not_Find_The_System_User_Or_An_Unknown_User_To_Update()
        {
            //ARRANGE
            SetupAdministrationScenario();
            var system = _users.Single(x => x.Id == SYSTEM_ID);

            //ACT & ASSERT
            (await _sut.UpdateProfileAsync(system.PublicId, "Renamed", "a@b.co", UserRole.Administrator, ADMIN_ID)).Result.ShouldBe(UserAdministrationResult.NotFound);
            (await _sut.UpdateProfileAsync(Guid.NewGuid(), "Nobody", "a@b.co", UserRole.Standard, ADMIN_ID)).Result.ShouldBe(UserAdministrationResult.NotFound);
            system.Name.ShouldBe("SYSTEM");
        }

        private static UserSettingsUpdate Settings(params UserRepSettingUpdate[] repSettings)
        {
            return new UserSettingsUpdate(true, 4, repSettings);
        }

        [TestMethod]
        public async Task Should_Update_Only_The_Callers_Own_Settings_And_Never_Touch_Other_Users_Rows()
        {
            //ARRANGE
            var mine = new UserMinMaxReps { Id = 10, SetType = SetType.Repetition, MinReps = 5, MaxReps = 6 };
            var removedByCaller = new UserMinMaxReps { Id = 11, SetType = SetType.Timed, MinReps = 1, MaxReps = 2 };
            var theirs = new UserMinMaxReps { Id = 99, SetType = SetType.Repetition, MinReps = 7, MaxReps = 8 };
            Frank.Settings = new UserSettings { RepSettings = new List<UserMinMaxReps> { mine, removedByCaller } };
            Paul.Settings = new UserSettings { RepSettings = new List<UserMinMaxReps> { theirs } };

            //ACT: edits row 10, drops row 11, and "edits" row 99, which belongs to someone else.
            var outcome = await _sut.UpdateSettingsAsync(STANDARD_ID, Settings(
                new UserRepSettingUpdate(10, SetType.Repetition, null, 10, 12),
                new UserRepSettingUpdate(99, SetType.Repetition, null, 1, 2)));

            //ASSERT
            outcome.Result.ShouldBe(UserAdministrationResult.Done);
            Frank.Settings.RecommendationsEnabled.ShouldBeTrue();
            Frank.Settings.LowestAcceptableRating.ShouldBe((byte)4);
            Frank.Settings.RepSettings.ShouldContain(mine);
            mine.MinReps.ShouldBe((byte)10);
            mine.MaxReps.ShouldBe((byte)12);
            Frank.Settings.RepSettings.ShouldNotContain(removedByCaller);
            Frank.Settings.RepSettings.Count.ShouldBe(2);
            Frank.Settings.RepSettings.Single(x => x != mine).Id.ShouldBe(0); //Row 99 was treated as a brand new row.

            theirs.MinReps.ShouldBe((byte)7); //The other user's row is untouched,
            theirs.MaxReps.ShouldBe((byte)8);
            Paul.Settings.RepSettings.ShouldBe(new[] { theirs }); //and still theirs.
            _userRepositoryMock.Verify(mock => mock.UpdateAsync(Frank, true), Times.Once);
        }

        [TestMethod]
        [DataRow(3, 2)]
        [DataRow(200, 100)]
        public async Task Should_Refuse_Rep_Settings_With_A_Minimum_Above_The_Maximum(int min, int max)
        {
            //ACT
            var outcome = await _sut.UpdateSettingsAsync(STANDARD_ID, Settings(new UserRepSettingUpdate(0, SetType.Repetition, null, (byte)min, (byte)max)));

            //ASSERT
            outcome.Result.ShouldBe(UserAdministrationResult.InvalidInput);
        }

        [TestMethod]
        public async Task Should_Refuse_An_Unknown_Set_Type_And_Too_Many_Rep_Settings()
        {
            //ACT & ASSERT
            (await _sut.UpdateSettingsAsync(STANDARD_ID, Settings(new UserRepSettingUpdate(0, (SetType)99, null, 1, 2))))
                .Result.ShouldBe(UserAdministrationResult.InvalidInput);

            var tooMany = Enumerable.Range(0, 21).Select(_ => new UserRepSettingUpdate(0, SetType.Repetition, null, 1, 2)).ToArray();
            (await _sut.UpdateSettingsAsync(STANDARD_ID, Settings(tooMany)))
                .Result.ShouldBe(UserAdministrationResult.InvalidInput);
        }

        [TestMethod]
        public async Task Should_Not_Update_Settings_For_A_Deactivated_User()
        {
            //ARRANGE
            Frank.Settings = new UserSettings { RepSettings = new List<UserMinMaxReps>() };
            Frank.IsActive = false;

            //ACT
            var outcome = await _sut.UpdateSettingsAsync(STANDARD_ID, Settings());

            //ASSERT
            outcome.Result.ShouldBe(UserAdministrationResult.NotFound);
        }

        [TestMethod]
        public async Task Should_Deactivate_A_User_And_End_Their_Sessions()
        {
            //ARRANGE
            SetupAdministrationScenario();

            //ACT
            var outcome = await _sut.DeactivateAsync(Frank.PublicId, ADMIN_ID);

            //ASSERT
            outcome.Result.ShouldBe(UserAdministrationResult.Done);
            Frank.IsActive.ShouldBeFalse();
            Frank.ModifiedByUserId.ShouldBe(ADMIN_ID);
            _userRepositoryMock.Verify(mock => mock.UpdateAsync(Frank, true), Times.Once);
            _refreshTokenServiceMock.Verify(x => x.RevokeByUserIdAsync(STANDARD_ID, It.IsAny<CancellationToken>()), Times.Once);
        }

        [TestMethod]
        public async Task Should_Treat_Deactivating_An_Inactive_User_As_Already_Done()
        {
            //ARRANGE
            SetupAdministrationScenario();
            Frank.IsActive = false;

            //ACT
            var outcome = await _sut.DeactivateAsync(Frank.PublicId, ADMIN_ID);

            //ASSERT
            outcome.Result.ShouldBe(UserAdministrationResult.Done);
            _userRepositoryMock.Verify(mock => mock.UpdateAsync(It.IsAny<User>(), true), Times.Never);
        }

        [TestMethod]
        public async Task Should_Not_Let_An_Administrator_Deactivate_Themselves()
        {
            //ARRANGE
            SetupAdministrationScenario();
            Frank.Role = UserRole.Administrator; //So that this is refused because it is themselves, not because they're the last one.

            //ACT
            var outcome = await _sut.DeactivateAsync(Paul.PublicId, ADMIN_ID);

            //ASSERT
            outcome.Result.ShouldBe(UserAdministrationResult.CannotDeactivateSelf);
            Paul.IsActive.ShouldBeTrue();
        }

        [TestMethod]
        public async Task Should_Always_Leave_At_Least_One_Active_Administrator()
        {
            //ARRANGE: two administrators.
            SetupAdministrationScenario();
            Frank.Role = UserRole.Administrator;

            //ACT: one deactivates the other, which is allowed because someone is left...
            var first = await _sut.DeactivateAsync(Frank.PublicId, ADMIN_ID);

            //...but the one who was deactivated can't then act to deactivate the last one.
            var second = await _sut.DeactivateAsync(Paul.PublicId, STANDARD_ID);

            //ASSERT
            first.Result.ShouldBe(UserAdministrationResult.Done);
            second.Result.ShouldBe(UserAdministrationResult.NotPermitted);
            Paul.IsActive.ShouldBeTrue();
        }

        [TestMethod]
        public async Task Should_Refuse_To_Deactivate_The_System_User_Or_An_Unknown_User()
        {
            //ARRANGE
            SetupAdministrationScenario();
            var system = _users.Single(x => x.Id == SYSTEM_ID);

            //ACT & ASSERT
            (await _sut.DeactivateAsync(system.PublicId, ADMIN_ID)).Result.ShouldBe(UserAdministrationResult.CannotDeactivateSystem);
            (await _sut.DeactivateAsync(Guid.NewGuid(), ADMIN_ID)).Result.ShouldBe(UserAdministrationResult.NotFound);
            system.IsActive.ShouldBeTrue();
        }

        [TestMethod]
        public async Task Should_Reactivate_A_User()
        {
            //ARRANGE
            SetupAdministrationScenario();
            Frank.IsActive = false;

            //ACT
            var outcome = await _sut.ReactivateAsync(Frank.PublicId, ADMIN_ID);

            //ASSERT
            outcome.Result.ShouldBe(UserAdministrationResult.Done);
            Frank.IsActive.ShouldBeTrue();
            _userRepositoryMock.Verify(mock => mock.UpdateAsync(Frank, true), Times.Once);
        }
    }
}
