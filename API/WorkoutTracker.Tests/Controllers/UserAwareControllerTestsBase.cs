using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Abstractions;
using System.Security.Claims;
using WorkoutTracker.API.Controllers;

namespace WorkoutTracker.Tests.Controllers
{
    public class UserAwareControllerTestsBase
    {
        public const string USER_ID = "1";

        protected static ILoggerFactory LoggerFactory { get; } = NullLoggerFactory.Instance;

        protected void SetupUser(UserAwareController controller)
        {
            var user = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
            {
                new Claim(ClaimTypes.Name, "Alan"),
                new Claim(ClaimTypes.Role, "Administrator"),
                new Claim("UserID", USER_ID)
            }));

            controller.ControllerContext = new ControllerContext()
            {
                HttpContext = new DefaultHttpContext() { User = user }
            };
        }
    }
}
