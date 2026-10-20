using System.Security.Claims;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.IdentityModel.JsonWebTokens;
using WorkoutTracker.BFF.Models;

namespace WorkoutTracker.BFF.Session
{
    /// <summary>
    /// Builds the cookie session's ClaimsPrincipal from the API's access token and projects it to the BffUser the SPA
    /// consumes. The token is NOT validated here: the BFF just received it directly from the API over the back
    /// channel, so there is nothing to verify. Claim names must match the API's TokenService.BuildToken.
    /// </summary>
    public static class SessionPrincipalFactory
    {
        public const string UserIdClaim = "UserID";
        public const string UserPublicIdClaim = "UserPublicID";

        public static ClaimsPrincipal? FromAccessToken(string accessToken)
        {
            var jwt = new JsonWebToken(accessToken);

            var name = jwt.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Name)?.Value;
            var role = jwt.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Role)?.Value;
            var userId = jwt.Claims.FirstOrDefault(c => c.Type == UserIdClaim)?.Value;
            var publicId = jwt.Claims.FirstOrDefault(c => c.Type == UserPublicIdClaim)?.Value;

            if (name is null || role is null || userId is null || publicId is null)
                return null;

            var identity = new ClaimsIdentity(
                [
                    new Claim(ClaimTypes.Name, name),
                    new Claim(ClaimTypes.Role, role),
                    new Claim(UserIdClaim, userId),
                    new Claim(UserPublicIdClaim, publicId)
                ],
                CookieAuthenticationDefaults.AuthenticationScheme);

            return new ClaimsPrincipal(identity);
        }

        public static BffUser ToBffUser(ClaimsPrincipal principal) =>
            new(
                principal.FindFirstValue(ClaimTypes.Name) ?? string.Empty,
                principal.IsInRole("Administrator"),
                int.Parse(principal.FindFirstValue(UserIdClaim)!),
                Guid.Parse(principal.FindFirstValue(UserPublicIdClaim)!));
    }
}
