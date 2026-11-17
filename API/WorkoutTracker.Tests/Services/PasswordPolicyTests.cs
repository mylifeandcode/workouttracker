using Microsoft.VisualStudio.TestTools.UnitTesting;
using Shouldly;
using WorkoutTracker.Application.Security;

namespace WorkoutTracker.Tests.Services
{
    [TestClass]
    public class PasswordPolicyTests
    {
        [TestMethod]
        public void Should_Accept_A_Password_Of_The_Minimum_Length()
        {
            PasswordPolicy.Validate(new string('a', PasswordPolicy.MinLength)).ShouldBeNull();
        }

        [TestMethod]
        public void Should_Accept_A_Password_Of_The_Maximum_Length()
        {
            PasswordPolicy.Validate(new string('a', PasswordPolicy.MaxLength)).ShouldBeNull();
        }

        [TestMethod]
        [DataRow(null)]
        [DataRow("")]
        [DataRow("short")]
        public void Should_Refuse_A_Missing_Or_Short_Password(string? password)
        {
            PasswordPolicy.Validate(password).ShouldBe($"The password must be at least {PasswordPolicy.MinLength} characters.");
        }

        [TestMethod]
        public void Should_Refuse_One_Character_Under_The_Minimum()
        {
            PasswordPolicy.Validate(new string('a', PasswordPolicy.MinLength - 1)).ShouldNotBeNull();
        }

        [TestMethod]
        public void Should_Refuse_A_Password_Over_The_Maximum_Length()
        {
            PasswordPolicy.Validate(new string('a', PasswordPolicy.MaxLength + 1)).ShouldBe($"The password must be at most {PasswordPolicy.MaxLength} characters.");
        }

        [TestMethod]
        public void Should_Be_The_Same_Twelve_Character_Rule_That_First_Administrator_Setup_Uses()
        {
            PasswordPolicy.MinLength.ShouldBe(12);
        }
    }
}
