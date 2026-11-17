using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.DependencyInjection;
using System.Threading.Tasks;
using WorkoutTracker.Application.Users.Interfaces;

namespace WorkoutTracker.API.Auth
{
    /// <summary>
    /// Runs after a bearer token has been validated and refuses it if its user has been deactivated since it was issued.
    /// Without this, a deactivated user would keep working until their access token expired. Costs one existence query
    /// per authenticated request.
    /// </summary>
    public static class ActiveUserTokenValidator
    {
        public static async Task OnTokenValidated(TokenValidatedContext context)
        {
            var userIdClaim = context.Principal?.FindFirst("UserID")?.Value;

            if (!int.TryParse(userIdClaim, out var userId))
            {
                context.Fail("The token has no valid user id.");
                return;
            }

            var userService = context.HttpContext.RequestServices.GetRequiredService<IUserService>();

            if (!await userService.IsActiveAsync(userId, context.HttpContext.RequestAborted))
                context.Fail("The user is not active.");
        }
    }
}
