using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Abstractions;
using System;
using System.Security.Claims;
using WorkoutTracker.API.Controllers;

namespace WorkoutTracker.Tests.Controllers
{
    public class UserAwareControllerTestsBase
    {
        public const string USER_ID = "1";

        protected static ILoggerFactory LoggerFactory { get; } = NullLoggerFactory.Instance;

        public static readonly Guid USER_PUBLIC_ID = Guid.Parse("11111111-1111-1111-1111-111111111111");

        protected void SetupUser(UserAwareController controller, string role = "Administrator", string userId = USER_ID, Guid? publicId = null)
        {
            var user = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
            {
                new Claim(ClaimTypes.Name, "Alan"),
                new Claim(ClaimTypes.Role, role),
                new Claim("UserID", userId),
                new Claim("UserPublicID", (publicId ?? USER_PUBLIC_ID).ToString())
            }));

            controller.ControllerContext = new ControllerContext()
            {
                HttpContext = new DefaultHttpContext() { User = user }
            };
        }
    }
}
