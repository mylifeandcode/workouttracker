using Microsoft.VisualStudio.TestTools.UnitTesting;
using Shouldly;
using System;
using System.Collections.Generic;
using System.Text.RegularExpressions;
using WorkoutTracker.Application.Users.Models;
using WorkoutTracker.Application.Users.Services;

namespace WorkoutTracker.Tests.Services
{
    [TestClass]
    public class SetupCodeProviderTests
    {
        private const string GENERATED_CODE_PATTERN = "[0-9A-HJKMNP-TV-Z]{4}(?:-[0-9A-HJKMNP-TV-Z]{4}){3}";
        private const string CONFIGURED_CODE = "my-configured-setup-code";
        private const string WRONG_CODE = "ZZZZ-ZZZZ-ZZZZ-ZZZZ";

        private List<string> _announcements;
        private TestTimeProvider _timeProvider;

        //The lockout is time-based, so the tests drive the clock themselves.
        private sealed class TestTimeProvider : TimeProvider
        {
            public DateTimeOffset UtcNow { get; set; } = new DateTimeOffset(2026, 11, 17, 12, 0, 0, TimeSpan.Zero);

            public override DateTimeOffset GetUtcNow() => UtcNow;
        }

        [TestInitialize]
        public void Initialize()
        {
            _announcements = new List<string>();
            _timeProvider = new TestTimeProvider();
        }

        private SetupCodeProvider CreateSut(string? configuredCode = null)
        {
            return new SetupCodeProvider(configuredCode, message => _announcements.Add(message), _timeProvider);
        }

        private string LastAnnouncedCode()
        {
            var match = Regex.Match(_announcements[^1], GENERATED_CODE_PATTERN);
            match.Success.ShouldBeTrue($"No code found in: {_announcements[^1]}");
            return match.Value;
        }

        private static void GuessWrongUntilTheLimitIsReached(SetupCodeProvider sut)
        {
            for (var i = 0; i < SetupCodeProvider.MaxFailedAttempts; i++)
                sut.Check(WRONG_CODE).ShouldBe(SetupCodeResult.Invalid);
        }

        [TestMethod]
        public void Should_Generate_And_Announce_A_Code_When_Activated()
        {
            //ARRANGE
            var sut = CreateSut();

            //ACT
            sut.EnsureActive();

            //ASSERT
            _announcements.Count.ShouldBe(1);
            LastAnnouncedCode().ShouldNotBeNullOrEmpty();
            sut.Check(LastAnnouncedCode()).ShouldBe(SetupCodeResult.Valid);
        }

        [TestMethod]
        public void Should_Announce_Only_Once_When_Activated_Repeatedly()
        {
            //ARRANGE
            var sut = CreateSut();

            //ACT
            sut.EnsureActive();
            sut.EnsureActive();
            sut.EnsureActive();

            //ASSERT
            _announcements.Count.ShouldBe(1);
        }

        [TestMethod]
        public void Should_Reject_Everything_When_No_Code_Is_Active()
        {
            //ARRANGE
            var sut = CreateSut();

            //ACT & ASSERT
            sut.Check("ABCD-EFGH-JKMN-PQRS").ShouldBe(SetupCodeResult.Invalid);
            sut.Check(null).ShouldBe(SetupCodeResult.Invalid);
            sut.Check("").ShouldBe(SetupCodeResult.Invalid);
        }

        [TestMethod]
        public void Should_Ignore_Case_Dashes_And_Spaces_When_Checking()
        {
            //ARRANGE
            var sut = CreateSut();
            sut.EnsureActive();
            var code = LastAnnouncedCode();

            //ACT & ASSERT
            sut.Check(code.ToLowerInvariant()).ShouldBe(SetupCodeResult.Valid);
            sut.Check(code.Replace("-", "")).ShouldBe(SetupCodeResult.Valid);
            sut.Check("  " + code.Replace("-", " ") + " ").ShouldBe(SetupCodeResult.Valid);
        }

        [TestMethod]
        public void Should_Reject_Wrong_And_Blank_Codes()
        {
            //ARRANGE
            var sut = CreateSut();
            sut.EnsureActive();

            //ACT & ASSERT
            sut.Check(WRONG_CODE).ShouldBe(SetupCodeResult.Invalid);
            sut.Check("   ").ShouldBe(SetupCodeResult.Invalid);
            sut.Check(null).ShouldBe(SetupCodeResult.Invalid);
        }

        [TestMethod]
        public void Should_Use_Configured_Code_Without_Printing_It()
        {
            //ARRANGE
            var sut = CreateSut(CONFIGURED_CODE);

            //ACT
            sut.EnsureActive();

            //ASSERT
            _announcements.Count.ShouldBe(1);
            _announcements[0].ShouldNotContain(CONFIGURED_CODE);
            sut.Check(CONFIGURED_CODE).ShouldBe(SetupCodeResult.Valid);
        }

        [TestMethod]
        public void Should_Refuse_A_Configured_Code_That_Is_Too_Short()
        {
            //ACT & ASSERT
            Should.Throw<InvalidOperationException>(() => CreateSut("too-short"));
        }

        [TestMethod]
        public void Should_Treat_A_Blank_Configured_Code_As_Not_Configured()
        {
            //ARRANGE
            var sut = CreateSut("   ");

            //ACT
            sut.EnsureActive();

            //ASSERT
            LastAnnouncedCode().ShouldNotBeNullOrEmpty();
        }

        [TestMethod]
        public void Should_Replace_A_Generated_Code_After_Too_Many_Wrong_Guesses()
        {
            //ARRANGE
            var sut = CreateSut();
            sut.EnsureActive();
            var originalCode = LastAnnouncedCode();

            //ACT
            GuessWrongUntilTheLimitIsReached(sut);

            //ASSERT
            _announcements.Count.ShouldBe(2);
            var newCode = LastAnnouncedCode();
            newCode.ShouldNotBe(originalCode);
            sut.Check(originalCode).ShouldBe(SetupCodeResult.Invalid);
            sut.Check(newCode).ShouldBe(SetupCodeResult.Valid);
        }

        [TestMethod]
        public void Should_Lock_Out_A_Configured_Code_After_Too_Many_Wrong_Guesses_Instead_Of_Replacing_It()
        {
            //ARRANGE
            var sut = CreateSut(CONFIGURED_CODE);
            sut.EnsureActive();

            //ACT
            GuessWrongUntilTheLimitIsReached(sut);

            //ASSERT
            sut.Check(WRONG_CODE).ShouldBe(SetupCodeResult.LockedOut);
            _announcements.Count.ShouldBe(1); //Only the original "use the configured code" message: nothing was replaced or announced.
        }

        [TestMethod]
        public void Should_Refuse_The_Right_Configured_Code_While_Locked_Out()
        {
            //ARRANGE
            var sut = CreateSut(CONFIGURED_CODE);
            sut.EnsureActive();
            GuessWrongUntilTheLimitIsReached(sut);

            //ACT & ASSERT
            sut.Check(CONFIGURED_CODE).ShouldBe(SetupCodeResult.LockedOut);

            _timeProvider.UtcNow += SetupCodeProvider.LockoutDuration - TimeSpan.FromSeconds(1);
            sut.Check(CONFIGURED_CODE).ShouldBe(SetupCodeResult.LockedOut);
        }

        [TestMethod]
        public void Should_Accept_The_Same_Configured_Code_Again_Once_The_Lockout_Ends()
        {
            //ARRANGE
            var sut = CreateSut(CONFIGURED_CODE);
            sut.EnsureActive();
            GuessWrongUntilTheLimitIsReached(sut);

            //ACT
            _timeProvider.UtcNow += SetupCodeProvider.LockoutDuration;

            //ASSERT
            sut.Check(CONFIGURED_CODE).ShouldBe(SetupCodeResult.Valid);
        }

        [TestMethod]
        public void Should_Count_Wrong_Guesses_Afresh_After_A_Lockout_Ends()
        {
            //ARRANGE
            var sut = CreateSut(CONFIGURED_CODE);
            sut.EnsureActive();
            GuessWrongUntilTheLimitIsReached(sut);
            _timeProvider.UtcNow += SetupCodeProvider.LockoutDuration;

            //ACT: one wrong guess is not enough to lock out again.
            sut.Check(WRONG_CODE).ShouldBe(SetupCodeResult.Invalid);

            //ASSERT
            sut.Check(CONFIGURED_CODE).ShouldBe(SetupCodeResult.Valid);
        }

        [TestMethod]
        public void Should_Deactivate_When_Cleared()
        {
            //ARRANGE
            var sut = CreateSut();
            sut.EnsureActive();
            var code = LastAnnouncedCode();

            //ACT
            sut.Clear();

            //ASSERT
            sut.Check(code).ShouldBe(SetupCodeResult.Invalid);
        }

        [TestMethod]
        public void Should_Make_A_Configured_Code_Valid_Again_When_Reactivated_After_Being_Cleared()
        {
            //ARRANGE
            var sut = CreateSut(CONFIGURED_CODE);
            sut.EnsureActive();
            sut.Clear();
            sut.Check(CONFIGURED_CODE).ShouldBe(SetupCodeResult.Invalid);
            _announcements.Clear();

            //ACT: setup is required again, e.g. every user was deleted.
            sut.EnsureActive();

            //ASSERT
            sut.Check(CONFIGURED_CODE).ShouldBe(SetupCodeResult.Valid);
            _announcements.Count.ShouldBe(1);
            _announcements[0].ShouldNotContain(CONFIGURED_CODE);
        }
    }
}
