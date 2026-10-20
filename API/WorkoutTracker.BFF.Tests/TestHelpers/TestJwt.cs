using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;

namespace WorkoutTracker.BFF.Tests.TestHelpers
{
    /// <summary>
    /// Builds access tokens shaped like the ones the API's TokenService issues: the same claim names (long URIs for name and
    /// role, plain "UserID" and "UserPublicID"), and an expiry the test controls. The BFF never validates the signature
    /// (it just received the token from the API over the back channel), but the token is signed anyway to look real.
    /// </summary>
    public static class TestJwt
    {
        private static readonly SigningCredentials Credentials = new(
            new SymmetricSecurityKey(Encoding.UTF8.GetBytes("test-signing-key-test-signing-key-1234")),
            SecurityAlgorithms.HmacSha256);

        public static string Create(
            TimeSpan lifetime,
            string? name = "test-user",
            string? role = "Standard",
            string? userId = "7",
            string? publicId = "b6e3f2a0-5b1c-4c8e-9a53-2d7a1c0f4e11")
        {
            //Passing null omits that claim, so tests can build tokens missing any one of them.
            var claims = new Dictionary<string, object>();
            if (name is not null) claims[ClaimTypes.Name] = name;
            if (role is not null) claims[ClaimTypes.Role] = role;
            if (userId is not null) claims["UserID"] = userId;
            if (publicId is not null) claims["UserPublicID"] = publicId;

            var expires = DateTime.UtcNow.Add(lifetime);

            return new JsonWebTokenHandler().CreateToken(new SecurityTokenDescriptor
            {
                Claims = claims,
                // A negative lifetime means "already expired", so NotBefore has to sit before Expires or creation throws.
                NotBefore = expires.AddHours(-1),
                Expires = expires,
                SigningCredentials = Credentials
            });
        }
    }
}
