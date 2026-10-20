using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Caching.Memory;
using WorkoutTracker.BFF.Session;

namespace WorkoutTracker.BFF.Tests.TestHelpers
{
    /// <summary>Builds sessions in a real MemoryTicketStore, the way the cookie handler would.</summary>
    public static class SessionTestHelper
    {
        public const string Scheme = "Cookies";

        public static MemoryTicketStore CreateStore() => new(new MemoryCache(new MemoryCacheOptions()));

        public static AuthenticationTicket CreateTicket(string accessToken, string refreshToken, DateTimeOffset? expiresUtc = null)
        {
            var properties = new AuthenticationProperties
            {
                IsPersistent = true,
                IssuedUtc = DateTimeOffset.UtcNow,
                ExpiresUtc = expiresUtc ?? DateTimeOffset.UtcNow.AddDays(7)
            };
            properties.StoreTokens(
            [
                new AuthenticationToken { Name = SessionKeys.AccessToken, Value = accessToken },
                new AuthenticationToken { Name = SessionKeys.RefreshToken, Value = refreshToken }
            ]);

            var principal = new ClaimsPrincipal(new ClaimsIdentity([new Claim(ClaimTypes.Name, "test-user")], Scheme));
            return new AuthenticationTicket(principal, properties, Scheme);
        }

        /// <summary>Stores a new session and returns its key.</summary>
        public static Task<string> StoreSessionAsync(
            MemoryTicketStore store, string accessToken, string refreshToken, DateTimeOffset? expiresUtc = null) =>
            store.StoreAsync(CreateTicket(accessToken, refreshToken, expiresUtc));
    }
}
