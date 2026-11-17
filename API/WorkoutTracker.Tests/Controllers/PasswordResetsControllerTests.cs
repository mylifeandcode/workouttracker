using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using Shouldly;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using WorkoutTracker.API.Controllers;
using WorkoutTracker.API.Models;
using WorkoutTracker.Application.Users.Interfaces;
using WorkoutTracker.Application.Users.Models;

namespace WorkoutTracker.Tests.Controllers
{
    [TestClass]
    public class PasswordResetsControllerTests : UserAwareControllerTestsBase
    {
        private static readonly Guid TARGET = Guid.Parse("33333333-3333-3333-3333-333333333333");

        private Mock<IPasswordResetService> _passwordResetServiceMock;
        private PasswordResetsController _sut;

        [TestInitialize]
        public void Initialize()
        {
            _passwordResetServiceMock = new Mock<IPasswordResetService>(MockBehavior.Strict);
            _sut = new PasswordResetsController(_passwordResetServiceMock.Object, LoggerFactory);
            SetupUser(_sut);
        }

        [TestMethod]
        public async Task Should_Return_The_Token_And_Its_Expiry_To_The_Administrator_Who_Asked()
        {
            //ARRANGE
            var expires = new DateTime(2026, 11, 17, 13, 0, 0, DateTimeKind.Utc);
            _passwordResetServiceMock
                .Setup(x => x.CreateResetForAdminAsync(TARGET, 1, It.IsAny<CancellationToken>()))
                .ReturnsAsync(new PasswordResetIssueOutcome(PasswordResetResult.Done, "theToken", expires));

            //ACT
            var result = await _sut.Create(TARGET);

            //ASSERT
            var dto = ((OkObjectResult)result.Result).Value.ShouldBeOfType<PasswordResetTokenDTO>();
            dto.Token.ShouldBe("theToken");
            dto.ExpiresAt.ShouldBe(expires);
        }

        [TestMethod]
        public async Task Should_Refuse_A_Caller_Who_Is_No_Longer_An_Administrator()
        {
            //ARRANGE: the token still says Administrator, but the database no longer agrees.
            _passwordResetServiceMock
                .Setup(x => x.CreateResetForAdminAsync(TARGET, 1, It.IsAny<CancellationToken>()))
                .ReturnsAsync(new PasswordResetIssueOutcome(PasswordResetResult.NotPermitted));

            //ACT
            var result = await _sut.Create(TARGET);

            //ASSERT
            result.Result.ShouldBeOfType<ForbidResult>();
        }

        [TestMethod]
        public async Task Should_Say_Not_Found_For_A_User_Who_Cannot_Be_Reset()
        {
            //ARRANGE
            _passwordResetServiceMock
                .Setup(x => x.CreateResetForAdminAsync(TARGET, 1, It.IsAny<CancellationToken>()))
                .ReturnsAsync(new PasswordResetIssueOutcome(PasswordResetResult.NotFound));

            //ACT
            var result = await _sut.Create(TARGET);

            //ASSERT
            result.Result.ShouldBeOfType<NotFoundResult>();
        }

        [TestMethod]
        public void Should_Be_For_Administrators_Only()
        {
            var authorize = typeof(PasswordResetsController).GetCustomAttributes(typeof(AuthorizeAttribute), true).Cast<AuthorizeAttribute>();

            authorize.Any(x => x.Roles == "Administrator").ShouldBeTrue();
            typeof(PasswordResetsController).GetCustomAttributes(typeof(AllowAnonymousAttribute), true).ShouldBeEmpty();
            typeof(PasswordResetsController).GetMethod(nameof(PasswordResetsController.Create))!
                .GetCustomAttributes(typeof(AllowAnonymousAttribute), true).ShouldBeEmpty();
        }
    }
}
