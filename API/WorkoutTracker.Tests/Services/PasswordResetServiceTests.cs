using Microsoft.Extensions.Configuration;
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
using WorkoutTracker.Application.Security.Services;
using WorkoutTracker.Application.Shared.Interfaces;
using WorkoutTracker.Application.Users.Models;
using WorkoutTracker.Application.Users.Services;
using WorkoutTracker.Domain.Users;
using WorkoutTracker.Repository;

namespace WorkoutTracker.Tests.Services
{
    [TestClass]
    public class PasswordResetServiceTests
    {
        private const string RESET_PAGE_URL = "https://app.example.com/user/reset-password";
        private const string GOOD_PASSWORD = "a-brand-new-password";

        private List<User> _users;
        private List<(string To, string Subject, string Body)> _emails;
        private Mock<IRepository<User>> _userRepositoryMock;
        private Mock<ICryptoService> _cryptoServiceMock;
        private Mock<IEmailService> _emailServiceMock;
        private Mock<IRefreshTokenService> _refreshTokenServiceMock;
        private TestTimeProvider _timeProvider;
        private PasswordResetService _sut;

        //Expiry and the cooldown are time-based, so the tests drive the clock themselves.
        private sealed class TestTimeProvider : TimeProvider
        {
            public DateTimeOffset UtcNow { get; set; } = new DateTimeOffset(2026, 11, 17, 12, 0, 0, TimeSpan.Zero);

            public override DateTimeOffset GetUtcNow() => UtcNow;
        }

        private User Alice => _users[0];
        private User Bob => _users[1];
        private User Carol => _users[2];
        private User SystemUser => _users[3];

        [TestInitialize]
        public void Initialize()
        {
            _users = new List<User>
            {
                new User { Id = 1, Name = "Alice", EmailAddress = "alice@here.com", Role = UserRole.Administrator, HashedPassword = "oldHash", Salt = "oldSalt" },
                new User { Id = 2, Name = "Bob", EmailAddress = "bob@here.com", Role = UserRole.Standard, HashedPassword = "oldHash", Salt = "oldSalt" },
                new User { Id = 3, Name = "Carol", EmailAddress = "carol@here.com", Role = UserRole.Standard, IsActive = false },
                new User { Id = 4, Name = "SYSTEM", EmailAddress = "system@here.com" }
            };
            _emails = new List<(string, string, string)>();
            _timeProvider = new TestTimeProvider();

            _userRepositoryMock = new Mock<IRepository<User>>(MockBehavior.Strict);
            _userRepositoryMock.Setup(x => x.Get()).Returns(() => _users.AsAsyncQueryable());
            _userRepositoryMock
                .Setup(x => x.AnyAsync(It.IsAny<Expression<Func<User, bool>>>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync((Expression<Func<User, bool>> predicate, CancellationToken _) => _users.Any(predicate.Compile()));
            _userRepositoryMock
                .Setup(x => x.UpdateAsync(It.IsAny<User>(), true, It.IsAny<CancellationToken>()))
                .ReturnsAsync((User user, bool _, CancellationToken __) => user);

            _cryptoServiceMock = new Mock<ICryptoService>(MockBehavior.Strict);
            _cryptoServiceMock.Setup(x => x.GenerateSalt()).Returns("newSalt");
            _cryptoServiceMock.Setup(x => x.ComputeHash(It.IsAny<string>(), It.IsAny<string>())).Returns("newHash");

            _emailServiceMock = new Mock<IEmailService>(MockBehavior.Strict);
            _emailServiceMock.SetupGet(x => x.IsEnabled).Returns(true);
            _emailServiceMock
                .Setup(x => x.SendEmailAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
                .Callback((string to, string from, string subject, string body, CancellationToken _) => _emails.Add((to, subject, body)))
                .Returns(Task.CompletedTask);

            _refreshTokenServiceMock = new Mock<IRefreshTokenService>(MockBehavior.Strict);
            _refreshTokenServiceMock.Setup(x => x.RevokeByUserIdAsync(It.IsAny<int>(), It.IsAny<CancellationToken>())).Returns(Task.CompletedTask);

            _sut = CreateSut();
        }

        private PasswordResetService CreateSut(string? resetPageUrl = RESET_PAGE_URL + "/", string lifetimeMinutes = "30")
        {
            var configuration = new ConfigurationBuilder()
                .AddInMemoryCollection(new Dictionary<string, string?>
                {
                    ["FrontEndResetPasswordURL"] = resetPageUrl,
                    ["PasswordReset:TokenLifetimeMinutes"] = lifetimeMinutes
                })
                .Build();

            return new PasswordResetService(
                _userRepositoryMock.Object,
                _cryptoServiceMock.Object,
                _emailServiceMock.Object,
                _refreshTokenServiceMock.Object,
                configuration,
                NullLogger<PasswordResetService>.Instance,
                _timeProvider);
        }

        private static string TokenIn(string emailBody)
        {
            var match = Regex.Match(emailBody, "#token=([A-Za-z0-9_-]+)");
            match.Success.ShouldBeTrue($"No token in: {emailBody}");
            return match.Groups[1].Value;
        }

        private async Task<string> RequestAndReadTokenAsync(string emailAddress)
        {
            _emails.Clear();
            await _sut.RequestResetEmailAsync(emailAddress);
            _emails.Count.ShouldBe(1);
            return TokenIn(_emails[0].Body);
        }

        //THE CONFIGURED ADDRESS OF THE RESET PAGE ///////////////////////////////////

        [TestMethod]
        [DataRow("https://app.example.com/user/reset-password", "https://app.example.com/user/reset-password")]
        [DataRow("https://app.example.com/user/reset-password/", "https://app.example.com/user/reset-password")]
        [DataRow("  http://localhost:4200/user/reset-password  ", "http://localhost:4200/user/reset-password")]
        public void Should_Accept_And_Tidy_A_Full_Reset_Page_Address(string configured, string expected)
        {
            PasswordResetService.NormalizeResetPageUrl(configured).ShouldBe(expected);
        }

        [TestMethod]
        [DataRow(null)]
        [DataRow("")]
        [DataRow("localhost:4200/reset-password/")] //The old default: no scheme, so it isn't a usable link in an email.
        [DataRow("/user/reset-password")]
        [DataRow("ftp://app.example.com/user/reset-password")]
        [DataRow("https://app.example.com/user/reset-password#token=x")]
        [DataRow("https://app.example.com/user/reset-password?x=1")]
        public void Should_Refuse_An_Address_That_Would_Make_A_Broken_Link(string? configured)
        {
            Should.Throw<InvalidOperationException>(() => PasswordResetService.NormalizeResetPageUrl(configured));
            Should.Throw<InvalidOperationException>(() => CreateSut(configured));
        }

        //THE PUBLIC REQUEST //////////////////////////////////////////////////////////

        [TestMethod]
        public async Task Should_Email_An_Active_User_A_Link_With_The_Token_After_A_Hash_Mark()
        {
            //ACT
            await _sut.RequestResetEmailAsync("alice@here.com");

            //ASSERT
            _emails.Count.ShouldBe(1);
            _emails[0].To.ShouldBe("alice@here.com");
            var token = TokenIn(_emails[0].Body);
            _emails[0].Body.ShouldContain($"{RESET_PAGE_URL}#token={token}");
            _emails[0].Body.ShouldNotContain("//user"); //The trailing slash in the configured address doesn't double up.
            _emails[0].Body.ShouldContain("30 minutes");
        }

        [TestMethod]
        public async Task Should_Store_Only_A_Hash_Of_The_Token_With_An_Expiry()
        {
            //ACT
            var token = await RequestAndReadTokenAsync("alice@here.com");

            //ASSERT
            Alice.PasswordResetTokenHash.ShouldBe(RefreshTokenService.ComputeSha256Hash(token));
            Alice.PasswordResetTokenHash.ShouldNotBe(token);
            Alice.PasswordResetTokenExpiresAt.ShouldBe(_timeProvider.UtcNow.UtcDateTime.AddMinutes(30));
        }

        [TestMethod]
        public async Task Should_Create_Long_Unrepeating_Url_Safe_Tokens()
        {
            //ACT
            var first = await RequestAndReadTokenAsync("alice@here.com");
            _timeProvider.UtcNow += PasswordResetService.RequestCooldown;
            var second = await RequestAndReadTokenAsync("alice@here.com");

            //ASSERT: 32 random bytes, URL-safe base64 without padding.
            Regex.IsMatch(first, "^[A-Za-z0-9_-]{43}$").ShouldBeTrue();
            second.ShouldNotBe(first);
        }

        [TestMethod]
        public async Task Should_Silently_Ignore_A_Request_For_An_Unknown_Inactive_Or_System_Address()
        {
            //ACT
            await _sut.RequestResetEmailAsync("nobody@here.com");
            await _sut.RequestResetEmailAsync("carol@here.com"); //Deactivated.
            await _sut.RequestResetEmailAsync("system@here.com");
            await _sut.RequestResetEmailAsync("");
            await _sut.RequestResetEmailAsync(null);

            //ASSERT: no email, and nothing was created for anyone.
            _emails.ShouldBeEmpty();
            _users.ShouldAllBe(user => user.PasswordResetTokenHash == null);
            _userRepositoryMock.Verify(x => x.UpdateAsync(It.IsAny<User>(), true, It.IsAny<CancellationToken>()), Times.Never);
        }

        [TestMethod]
        public async Task Should_Not_Create_A_Token_That_Nobody_Could_Be_Sent_When_Email_Is_Not_Configured()
        {
            //ARRANGE
            _emailServiceMock.SetupGet(x => x.IsEnabled).Returns(false);

            //ACT
            await _sut.RequestResetEmailAsync("alice@here.com");

            //ASSERT
            Alice.PasswordResetTokenHash.ShouldBeNull();
            _emails.ShouldBeEmpty();
        }

        [TestMethod]
        public async Task Should_Not_Reveal_A_Failure_To_Send_The_Email()
        {
            //ARRANGE: an SMTP error only ever happens for addresses that really have an account, so it must not escape.
            _emailServiceMock
                .Setup(x => x.SendEmailAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
                .ThrowsAsync(new InvalidOperationException("SMTP server smtp.secret.example refused the connection"));

            //ACT & ASSERT
            await Should.NotThrowAsync(() => _sut.RequestResetEmailAsync("alice@here.com"));
        }

        [TestMethod]
        public async Task Should_Let_Cancellation_Through()
        {
            //ARRANGE
            using var cts = new CancellationTokenSource();
            cts.Cancel();
            _userRepositoryMock.Setup(x => x.Get()).Throws(new OperationCanceledException(cts.Token));

            //ACT & ASSERT
            await Should.ThrowAsync<OperationCanceledException>(() => _sut.RequestResetEmailAsync("alice@here.com", cts.Token));
        }

        [TestMethod]
        public async Task Should_Not_Let_Someone_Bury_A_Victims_Inbox_In_Reset_Emails()
        {
            //ACT: three requests in a row, then one after the cooldown.
            await _sut.RequestResetEmailAsync("alice@here.com");
            await _sut.RequestResetEmailAsync("alice@here.com");
            await _sut.RequestResetEmailAsync("alice@here.com");
            _emails.Count.ShouldBe(1);

            _timeProvider.UtcNow += PasswordResetService.RequestCooldown;
            await _sut.RequestResetEmailAsync("alice@here.com");

            //ASSERT
            _emails.Count.ShouldBe(2);
        }

        [TestMethod]
        public async Task Should_Replace_The_Earlier_Token_When_A_New_One_Is_Issued()
        {
            //ARRANGE
            var first = await RequestAndReadTokenAsync("alice@here.com");
            _timeProvider.UtcNow += PasswordResetService.RequestCooldown;

            //ACT
            var second = await RequestAndReadTokenAsync("alice@here.com");

            //ASSERT: only one token is live per user.
            (await _sut.ValidateTokenAsync(first)).ShouldBeFalse();
            (await _sut.ValidateTokenAsync(second)).ShouldBeTrue();
        }

        //VALIDATING A TOKEN //////////////////////////////////////////////////////////

        [TestMethod]
        public async Task Should_Accept_A_Live_Token_And_Refuse_Anything_Else()
        {
            //ARRANGE
            var token = await RequestAndReadTokenAsync("alice@here.com");

            //ACT & ASSERT
            (await _sut.ValidateTokenAsync(token)).ShouldBeTrue();
            (await _sut.ValidateTokenAsync("  " + token + "  ")).ShouldBeTrue();
            (await _sut.ValidateTokenAsync("not-the-token")).ShouldBeFalse();
            (await _sut.ValidateTokenAsync("")).ShouldBeFalse();
            (await _sut.ValidateTokenAsync(null)).ShouldBeFalse();
            (await _sut.ValidateTokenAsync(new string('a', 500))).ShouldBeFalse();
        }

        [TestMethod]
        public async Task Should_Refuse_A_Token_Once_It_Has_Expired()
        {
            //ARRANGE
            var token = await RequestAndReadTokenAsync("alice@here.com");

            //ACT
            _timeProvider.UtcNow += TimeSpan.FromMinutes(30);

            //ASSERT
            (await _sut.ValidateTokenAsync(token)).ShouldBeFalse();
        }

        [TestMethod]
        public async Task Should_Refuse_The_Token_Of_A_User_Who_Has_Since_Been_Deactivated()
        {
            //ARRANGE
            var token = await RequestAndReadTokenAsync("bob@here.com");

            //ACT
            Bob.IsActive = false;

            //ASSERT
            (await _sut.ValidateTokenAsync(token)).ShouldBeFalse();
        }

        //RESETTING THE PASSWORD ///////////////////////////////////////////////////////

        [TestMethod]
        public async Task Should_Reset_The_Password_With_A_New_Salt_Spend_The_Token_And_End_Their_Sessions()
        {
            //ARRANGE
            var token = await RequestAndReadTokenAsync("bob@here.com");

            //ACT
            var outcome = await _sut.ResetPasswordAsync(token, GOOD_PASSWORD);

            //ASSERT
            outcome.Result.ShouldBe(PasswordResetResult.Done);
            Bob.Salt.ShouldBe("newSalt");
            Bob.HashedPassword.ShouldBe("newHash");
            _cryptoServiceMock.Verify(x => x.ComputeHash(GOOD_PASSWORD, "newSalt"), Times.Once);
            Bob.PasswordResetTokenHash.ShouldBeNull();
            Bob.PasswordResetTokenExpiresAt.ShouldBeNull();
            _refreshTokenServiceMock.Verify(x => x.RevokeByUserIdAsync(Bob.Id, It.IsAny<CancellationToken>()), Times.Once);
        }

        [TestMethod]
        public async Task Should_Only_Let_A_Token_Be_Used_Once()
        {
            //ARRANGE
            var token = await RequestAndReadTokenAsync("bob@here.com");
            (await _sut.ResetPasswordAsync(token, GOOD_PASSWORD)).Result.ShouldBe(PasswordResetResult.Done);

            //ACT
            var second = await _sut.ResetPasswordAsync(token, "another-brand-new-password");

            //ASSERT
            second.Result.ShouldBe(PasswordResetResult.InvalidToken);
        }

        [TestMethod]
        [DataRow("")]
        [DataRow("short")]
        public async Task Should_Refuse_A_Weak_Password_Without_Spending_The_Token(string password)
        {
            //ARRANGE
            var token = await RequestAndReadTokenAsync("bob@here.com");

            //ACT
            var outcome = await _sut.ResetPasswordAsync(token, password);

            //ASSERT
            outcome.Result.ShouldBe(PasswordResetResult.InvalidPassword);
            outcome.Message.ShouldContain("at least 12 characters");
            Bob.HashedPassword.ShouldBe("oldHash");
            (await _sut.ValidateTokenAsync(token)).ShouldBeTrue();
            _refreshTokenServiceMock.Verify(x => x.RevokeByUserIdAsync(It.IsAny<int>(), It.IsAny<CancellationToken>()), Times.Never);
        }

        [TestMethod]
        public async Task Should_Give_The_Same_Answer_For_An_Unknown_Expired_Or_Deactivated_Users_Token()
        {
            //ARRANGE
            var expired = await RequestAndReadTokenAsync("bob@here.com");
            _timeProvider.UtcNow += TimeSpan.FromMinutes(31);
            var deactivated = await RequestAndReadTokenAsync("alice@here.com");
            Alice.IsActive = false;

            //ACT & ASSERT
            (await _sut.ResetPasswordAsync("never-issued", GOOD_PASSWORD)).Result.ShouldBe(PasswordResetResult.InvalidToken);
            (await _sut.ResetPasswordAsync(expired, GOOD_PASSWORD)).Result.ShouldBe(PasswordResetResult.InvalidToken);
            (await _sut.ResetPasswordAsync(deactivated, GOOD_PASSWORD)).Result.ShouldBe(PasswordResetResult.InvalidToken);
            (await _sut.ResetPasswordAsync(null, GOOD_PASSWORD)).Result.ShouldBe(PasswordResetResult.InvalidToken);
            Bob.HashedPassword.ShouldBe("oldHash");
        }

        //AN ADMINISTRATOR CREATING A RESET (INSTALLATIONS WITHOUT EMAIL) ///////////////

        [TestMethod]
        public async Task Should_Let_An_Administrator_Create_A_Token_For_A_User()
        {
            //ACT
            var outcome = await _sut.CreateResetForAdminAsync(Bob.PublicId, Alice.Id);

            //ASSERT
            outcome.Result.ShouldBe(PasswordResetResult.Done);
            outcome.ExpiresAt.ShouldBe(_timeProvider.UtcNow.UtcDateTime.AddMinutes(30));
            (await _sut.ValidateTokenAsync(outcome.Token)).ShouldBeTrue();
            Bob.PasswordResetTokenHash.ShouldBe(RefreshTokenService.ComputeSha256Hash(outcome.Token!));
            _emails.ShouldBeEmpty();
        }

        [TestMethod]
        public async Task Should_Let_An_Administrator_Create_A_Token_Straight_Away_Again()
        {
            //ACT: unlike the public request, an administrator isn't held to the cooldown.
            var first = await _sut.CreateResetForAdminAsync(Bob.PublicId, Alice.Id);
            var second = await _sut.CreateResetForAdminAsync(Bob.PublicId, Alice.Id);

            //ASSERT
            second.Result.ShouldBe(PasswordResetResult.Done);
            second.Token.ShouldNotBe(first.Token);
            (await _sut.ValidateTokenAsync(first.Token)).ShouldBeFalse();
        }

        [TestMethod]
        public async Task Should_Refuse_To_Create_A_Token_For_A_Caller_Who_Is_Not_An_Active_Administrator()
        {
            //ACT & ASSERT: a standard user, a deactivated administrator, and nobody at all.
            (await _sut.CreateResetForAdminAsync(Alice.PublicId, Bob.Id)).Result.ShouldBe(PasswordResetResult.NotPermitted);

            Alice.IsActive = false;
            (await _sut.CreateResetForAdminAsync(Bob.PublicId, Alice.Id)).Result.ShouldBe(PasswordResetResult.NotPermitted);
            (await _sut.CreateResetForAdminAsync(Bob.PublicId, 12345)).Result.ShouldBe(PasswordResetResult.NotPermitted);

            _users.ShouldAllBe(user => user.PasswordResetTokenHash == null);
        }

        [TestMethod]
        public async Task Should_Not_Create_A_Token_For_An_Unknown_Deactivated_Or_System_User()
        {
            //ACT & ASSERT
            (await _sut.CreateResetForAdminAsync(Guid.NewGuid(), Alice.Id)).Result.ShouldBe(PasswordResetResult.NotFound);
            (await _sut.CreateResetForAdminAsync(Carol.PublicId, Alice.Id)).Result.ShouldBe(PasswordResetResult.NotFound);
            (await _sut.CreateResetForAdminAsync(SystemUser.PublicId, Alice.Id)).Result.ShouldBe(PasswordResetResult.NotFound);
        }

        [TestMethod]
        public async Task Should_Honor_The_Configured_Token_Lifetime()
        {
            //ARRANGE
            _sut = CreateSut(lifetimeMinutes: "5");

            //ACT
            var outcome = await _sut.CreateResetForAdminAsync(Bob.PublicId, Alice.Id);

            //ASSERT
            outcome.ExpiresAt.ShouldBe(_timeProvider.UtcNow.UtcDateTime.AddMinutes(5));
        }

        [TestMethod]
        [DataRow("0")]
        [DataRow("-3")]
        [DataRow("soon")]
        public async Task Should_Fall_Back_To_The_Default_Lifetime_For_A_Setting_That_Makes_No_Sense(string setting)
        {
            //ARRANGE
            _sut = CreateSut(lifetimeMinutes: setting);

            //ACT
            var outcome = await _sut.CreateResetForAdminAsync(Bob.PublicId, Alice.Id);

            //ASSERT
            outcome.ExpiresAt.ShouldBe(_timeProvider.UtcNow.UtcDateTime.AddMinutes(PasswordResetService.DefaultTokenLifetimeMinutes));
        }
    }
}
