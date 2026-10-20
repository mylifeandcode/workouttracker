using System.Security.Claims;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Shouldly;
using WorkoutTracker.BFF.Session;
using WorkoutTracker.BFF.Tests.TestHelpers;

namespace WorkoutTracker.BFF.Tests.Session
{
    [TestClass]
    public class SessionPrincipalFactoryTests
    {
        private static readonly TimeSpan AnyLifetime = TimeSpan.FromHours(2);
        private const string PublicId = "b6e3f2a0-5b1c-4c8e-9a53-2d7a1c0f4e11";

        [TestMethod]
        public void Should_Build_An_Authenticated_Principal_From_The_Api_Access_Token()
        {
            //ARRANGE
            var token = TestJwt.Create(AnyLifetime, name: "Alan", role: "Administrator", userId: "42", publicId: PublicId);

            //ACT
            var principal = SessionPrincipalFactory.FromAccessToken(token);

            //ASSERT
            principal.ShouldNotBeNull();
            principal.Identity!.IsAuthenticated.ShouldBeTrue();
            principal.FindFirstValue(ClaimTypes.Name).ShouldBe("Alan");
            principal.FindFirstValue(ClaimTypes.Role).ShouldBe("Administrator");
            principal.FindFirstValue(SessionPrincipalFactory.UserIdClaim).ShouldBe("42");
            principal.FindFirstValue(SessionPrincipalFactory.UserPublicIdClaim).ShouldBe(PublicId);
        }

        [TestMethod]
        public void Should_Not_Copy_Anything_But_The_Four_Identity_Claims_Into_The_Session()
        {
            var principal = SessionPrincipalFactory.FromAccessToken(TestJwt.Create(AnyLifetime));

            principal!.Claims.Select(c => c.Type).ShouldBe(
                [ClaimTypes.Name, ClaimTypes.Role, SessionPrincipalFactory.UserIdClaim, SessionPrincipalFactory.UserPublicIdClaim],
                ignoreOrder: true);
        }

        [TestMethod]
        public void Should_Reject_A_Token_Missing_The_Name_Claim()
        {
            SessionPrincipalFactory.FromAccessToken(TestJwt.Create(AnyLifetime, name: null)).ShouldBeNull();
        }

        [TestMethod]
        public void Should_Reject_A_Token_Missing_The_Role_Claim()
        {
            SessionPrincipalFactory.FromAccessToken(TestJwt.Create(AnyLifetime, role: null)).ShouldBeNull();
        }

        [TestMethod]
        public void Should_Reject_A_Token_Missing_The_UserId_Claim()
        {
            SessionPrincipalFactory.FromAccessToken(TestJwt.Create(AnyLifetime, userId: null)).ShouldBeNull();
        }

        [TestMethod]
        public void Should_Reject_A_Token_Missing_The_UserPublicId_Claim()
        {
            SessionPrincipalFactory.FromAccessToken(TestJwt.Create(AnyLifetime, publicId: null)).ShouldBeNull();
        }

        [TestMethod]
        public void Should_Still_Read_An_Already_Expired_Token_Because_Expiry_Is_Not_Its_Concern()
        {
            //Expiry is the refresh service's job; building the principal must not depend on it.
            SessionPrincipalFactory.FromAccessToken(TestJwt.Create(TimeSpan.FromMinutes(-5))).ShouldNotBeNull();
        }

        [TestMethod]
        public void Should_Project_An_Administrator_To_The_User_The_Spa_Sees()
        {
            var principal = SessionPrincipalFactory.FromAccessToken(
                TestJwt.Create(AnyLifetime, name: "Alan", role: "Administrator", userId: "42", publicId: PublicId))!;

            var user = SessionPrincipalFactory.ToBffUser(principal);

            user.UserName.ShouldBe("Alan");
            user.IsAdmin.ShouldBeTrue();
            user.UserId.ShouldBe(42);
            user.UserPublicId.ShouldBe(Guid.Parse(PublicId));
        }

        [TestMethod]
        public void Should_Project_A_Standard_User_As_Not_An_Administrator()
        {
            var principal = SessionPrincipalFactory.FromAccessToken(TestJwt.Create(AnyLifetime, role: "Standard"))!;

            SessionPrincipalFactory.ToBffUser(principal).IsAdmin.ShouldBeFalse();
        }
    }
}
