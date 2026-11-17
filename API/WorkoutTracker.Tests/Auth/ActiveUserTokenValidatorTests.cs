using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Moq;
using Shouldly;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using WorkoutTracker.API.Auth;
using WorkoutTracker.Application.Users.Interfaces;

namespace WorkoutTracker.Tests.Auth
{
    [TestClass]
    public class ActiveUserTokenValidatorTests
    {
        private Mock<IUserService> _userServiceMock;

        [TestInitialize]
        public void Initialize()
        {
            _userServiceMock = new Mock<IUserService>(MockBehavior.Strict);
        }

        private TokenValidatedContext CreateContext(params Claim[] claims)
        {
            var services = new ServiceCollection().AddSingleton(_userServiceMock.Object).BuildServiceProvider();
            var httpContext = new DefaultHttpContext { RequestServices = services };

            return new TokenValidatedContext(
                httpContext,
                new AuthenticationScheme(JwtBearerDefaults.AuthenticationScheme, null, typeof(JwtBearerHandler)),
                new JwtBearerOptions())
            {
                Principal = new ClaimsPrincipal(new ClaimsIdentity(claims, "test"))
            };
        }

        [TestMethod]
        public async Task Should_Accept_The_Token_Of_An_Active_User()
        {
            //ARRANGE
            _userServiceMock.Setup(x => x.IsActiveAsync(5, It.IsAny<CancellationToken>())).ReturnsAsync(true);
            var context = CreateContext(new Claim("UserID", "5"));

            //ACT
            await ActiveUserTokenValidator.OnTokenValidated(context);

            //ASSERT
            context.Result.ShouldBeNull();
        }

        [TestMethod]
        public async Task Should_Refuse_The_Token_Of_A_Deactivated_User()
        {
            //ARRANGE
            _userServiceMock.Setup(x => x.IsActiveAsync(5, It.IsAny<CancellationToken>())).ReturnsAsync(false);
            var context = CreateContext(new Claim("UserID", "5"));

            //ACT
            await ActiveUserTokenValidator.OnTokenValidated(context);

            //ASSERT
            context.Result.ShouldNotBeNull();
            context.Result.Succeeded.ShouldBeFalse();
        }

        [TestMethod]
        [DataRow(null)]
        [DataRow("not-a-number")]
        public async Task Should_Refuse_A_Token_Without_A_Usable_User_Id(string userId)
        {
            //ARRANGE
            var context = userId == null ? CreateContext() : CreateContext(new Claim("UserID", userId));

            //ACT
            await ActiveUserTokenValidator.OnTokenValidated(context);

            //ASSERT
            context.Result.ShouldNotBeNull();
            context.Result.Succeeded.ShouldBeFalse();
            _userServiceMock.Verify(x => x.IsActiveAsync(It.IsAny<int>(), It.IsAny<CancellationToken>()), Times.Never);
        }
    }
}
