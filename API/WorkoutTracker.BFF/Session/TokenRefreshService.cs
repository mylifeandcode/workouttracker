using Microsoft.IdentityModel.JsonWebTokens;
using WorkoutTracker.BFF.Auth;

namespace WorkoutTracker.BFF.Session
{
    /// <summary>
    /// Keeps a session's access token fresh. This is the server-side replacement for the browser's old
    /// "401, refresh, replay" interceptor, and it is safe where that was not: refreshes are single-flight per session.
    /// The API rotates the refresh token on every use and revokes the whole chain if an old one is presented again,
    /// so two parallel requests must never both refresh with the same token.
    /// </summary>
    public class TokenRefreshService
    {
        // Refresh slightly early so a token cannot expire between the check here and the API validating it.
        public static readonly TimeSpan RefreshWindow = TimeSpan.FromSeconds(60);

        private readonly MemoryTicketStore _store;
        private readonly ApiAuthClient _api;
        private readonly ILogger<TokenRefreshService> _logger;
        private readonly RefreshLocks _locks;

        public TokenRefreshService(MemoryTicketStore store, ApiAuthClient api, RefreshLocks locks, ILogger<TokenRefreshService> logger)
        {
            _store = store ?? throw new ArgumentNullException(nameof(store));
            _api = api ?? throw new ArgumentNullException(nameof(api));
            _locks = locks ?? throw new ArgumentNullException(nameof(locks));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public static bool IsExpiring(string accessToken) =>
            new JsonWebToken(accessToken).ValidTo <= DateTime.UtcNow.Add(RefreshWindow);

        /// <summary>
        /// Returns a usable access token for the session, refreshing first if needed. Returns null if the session is
        /// dead (it is removed). Throws HttpRequestException if the API was unreachable, leaving the session intact.
        /// </summary>
        public async Task<string?> GetFreshAccessTokenAsync(string sessionKey, CancellationToken ct)
        {
            var current = _store.GetTokens(sessionKey);
            if (current is null)
                return null;
            if (!IsExpiring(current.AccessToken))
                return current.AccessToken;

            var gate = _locks.For(sessionKey);
            await gate.WaitAsync(ct);
            try
            {
                // Re-read inside the lock: another request may have refreshed while this one waited its turn.
                current = _store.GetTokens(sessionKey);
                if (current is null)
                    return null;
                if (!IsExpiring(current.AccessToken))
                    return current.AccessToken;

                var refreshed = await _api.RefreshAsync(current, ct);
                if (refreshed is null)
                {
                    _logger.LogInformation("API rejected the refresh token; ending the session.");
                    await _store.RemoveAsync(sessionKey);
                    _locks.Forget(sessionKey);
                    return null;
                }

                _store.UpdateTokens(sessionKey, refreshed);
                return refreshed.AccessToken;
            }
            finally
            {
                gate.Release();
            }
        }

        /// <summary>Releases the per-session lock once a session ends (logout).</summary>
        public void Forget(string sessionKey) => _locks.Forget(sessionKey);
    }
}
