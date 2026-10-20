using System.Net;
using System.Net.Http.Headers;
using WorkoutTracker.BFF.Models;

namespace WorkoutTracker.BFF.Auth
{
    public record ApiLoginResult(HttpStatusCode StatusCode, AuthTokens? Tokens);

    /// <summary>Back-channel client for the API's auth endpoints (login/refresh/revoke). The BFF owns these calls; the SPA never makes them.</summary>
    public class ApiAuthClient
    {
        private readonly HttpClient _http;

        public ApiAuthClient(HttpClient http)
        {
            _http = http ?? throw new ArgumentNullException(nameof(http));
        }

        public async Task<ApiLoginResult> LoginAsync(LoginRequest request, CancellationToken ct)
        {
            using var response = await _http.PostAsJsonAsync("api/auth/login", request, ct);
            if (!response.IsSuccessStatusCode)
                return new ApiLoginResult(response.StatusCode, null);

            var tokens = await response.Content.ReadFromJsonAsync<AuthTokens>(ct);
            return new ApiLoginResult(response.StatusCode, tokens);
        }

        /// <summary>
        /// Exchanges the token pair for a new one. Returns null when the API rejects the pair (400/401: expired,
        /// revoked or replayed refresh token), meaning the session is dead. Any other failure throws
        /// HttpRequestException, meaning "try again later": the session itself may still be good.
        /// </summary>
        public async Task<AuthTokens?> RefreshAsync(AuthTokens current, CancellationToken ct)
        {
            using var response = await _http.PostAsJsonAsync("api/auth/refresh", current, ct);

            if (response.StatusCode is HttpStatusCode.Unauthorized or HttpStatusCode.BadRequest)
                return null;

            response.EnsureSuccessStatusCode();
            return await response.Content.ReadFromJsonAsync<AuthTokens>(ct);
        }

        // Best effort: the API revokes all of the user's refresh tokens. A failure must not block sign-out.
        public async Task RevokeAsync(string accessToken, CancellationToken ct)
        {
            using var message = new HttpRequestMessage(HttpMethod.Post, "api/auth/revoke");
            message.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
            using var response = await _http.SendAsync(message, ct);
        }
    }
}
