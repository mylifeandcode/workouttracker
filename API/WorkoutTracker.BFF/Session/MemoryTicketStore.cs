using System.Security.Cryptography;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.Extensions.Caching.Memory;
using WorkoutTracker.BFF.Models;

namespace WorkoutTracker.BFF.Session
{
    /// <summary>
    /// Server-side session storage. The auth cookie holds only a random session key; the ticket (claims plus the
    /// API access/refresh tokens) stays in BFF memory, so the browser never sees a token. Sessions are lost when
    /// the BFF restarts, which just means the user signs in again.
    /// </summary>
    public class MemoryTicketStore : ITicketStore
    {
        private static readonly TimeSpan DefaultLifetime = TimeSpan.FromDays(7);
        private readonly IMemoryCache _cache;

        public MemoryTicketStore(IMemoryCache cache)
        {
            _cache = cache ?? throw new ArgumentNullException(nameof(cache));
        }

        public Task<string> StoreAsync(AuthenticationTicket ticket)
        {
            var key = Convert.ToHexString(RandomNumberGenerator.GetBytes(32));
            ticket.Properties.Items[SessionKeys.SessionKey] = key;
            Save(key, ticket);
            return Task.FromResult(key);
        }

        // Called by the cookie handler when it slides the expiration forward. The handler passes the ticket it loaded
        // at the START of the request, which may predate a token refresh done during that same request. Taking its
        // tokens would roll back to a refresh token the API has already rotated away, and the API would treat the
        // next refresh as a replay and revoke the whole chain. So only the lifetime is taken from the incoming ticket.
        public Task RenewAsync(string key, AuthenticationTicket ticket)
        {
            if (_cache.TryGetValue(key, out AuthenticationTicket? current) && current is not null)
            {
                var properties = Clone(current.Properties);
                properties.IssuedUtc = ticket.Properties.IssuedUtc;
                properties.ExpiresUtc = ticket.Properties.ExpiresUtc;
                Save(key, new AuthenticationTicket(current.Principal, properties, current.AuthenticationScheme));
            }
            else
            {
                Save(key, ticket);
            }
            return Task.CompletedTask;
        }

        public Task<AuthenticationTicket?> RetrieveAsync(string key)
        {
            _cache.TryGetValue(key, out AuthenticationTicket? ticket);
            return Task.FromResult(ticket);
        }

        public Task RemoveAsync(string key)
        {
            _cache.Remove(key);
            return Task.CompletedTask;
        }

        /// <summary>The latest tokens for a session, or null if the session no longer exists.</summary>
        public AuthTokens? GetTokens(string key)
        {
            if (!_cache.TryGetValue(key, out AuthenticationTicket? ticket) || ticket is null)
                return null;

            var access = ticket.Properties.GetTokenValue(SessionKeys.AccessToken);
            var refresh = ticket.Properties.GetTokenValue(SessionKeys.RefreshToken);
            return access is null || refresh is null ? null : new AuthTokens(access, refresh);
        }

        /// <summary>
        /// Swaps in a new ticket carrying the rotated tokens. A new ticket is built (rather than mutating the cached
        /// one) because requests on other threads may be reading the existing instance's property dictionary.
        /// </summary>
        public void UpdateTokens(string key, AuthTokens tokens)
        {
            if (!_cache.TryGetValue(key, out AuthenticationTicket? current) || current is null)
                return;

            var properties = Clone(current.Properties);
            properties.UpdateTokenValue(SessionKeys.AccessToken, tokens.AccessToken);
            properties.UpdateTokenValue(SessionKeys.RefreshToken, tokens.RefreshToken);
            Save(key, new AuthenticationTicket(current.Principal, properties, current.AuthenticationScheme));
        }

        private void Save(string key, AuthenticationTicket ticket)
        {
            var expiresUtc = ticket.Properties.ExpiresUtc ?? DateTimeOffset.UtcNow.Add(DefaultLifetime);
            _cache.Set(key, ticket, new MemoryCacheEntryOptions { AbsoluteExpiration = expiresUtc });
        }

        private static AuthenticationProperties Clone(AuthenticationProperties source) =>
            new(new Dictionary<string, string?>(source.Items), new Dictionary<string, object?>(source.Parameters))
            {
                IsPersistent = source.IsPersistent
            };
    }
}
