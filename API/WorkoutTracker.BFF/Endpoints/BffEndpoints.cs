using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using WorkoutTracker.BFF.Auth;
using WorkoutTracker.BFF.Models;
using WorkoutTracker.BFF.Session;

namespace WorkoutTracker.BFF.Endpoints
{
    /// <summary>The session endpoints the SPA uses instead of calling the API's auth endpoints and handling tokens itself.</summary>
    public static class BffEndpoints
    {
        public const string AccessTokenName = SessionKeys.AccessToken;
        public const string RefreshTokenName = SessionKeys.RefreshToken;

        public static IEndpointRouteBuilder MapBffEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("/bff");

            group.MapPost("/login", LoginAsync);
            group.MapGet("/user", GetUser).RequireAuthorization();
            group.MapPost("/logout", LogoutAsync);

            return app;
        }

        private static async Task<IResult> LoginAsync(
            LoginRequest request, HttpContext http, ApiAuthClient api, CancellationToken ct)
        {
            var result = await api.LoginAsync(request, ct);

            // Pass the API's failure through (404 unknown user, 401 bad password, 400 bad request) so the SPA's existing handling still works.
            if (result.Tokens is null)
                return Results.StatusCode((int)result.StatusCode);

            var principal = SessionPrincipalFactory.FromAccessToken(result.Tokens.AccessToken);
            if (principal is null)
                return Results.StatusCode(StatusCodes.Status502BadGateway);

            // The tokens ride in the server-side ticket (see MemoryTicketStore), never in the cookie or the response body.
            var properties = new AuthenticationProperties { IsPersistent = true };
            properties.StoreTokens(
            [
                new AuthenticationToken { Name = AccessTokenName, Value = result.Tokens.AccessToken },
                new AuthenticationToken { Name = RefreshTokenName, Value = result.Tokens.RefreshToken }
            ]);

            await http.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, principal, properties);

            return Results.Ok(SessionPrincipalFactory.ToBffUser(principal));
        }

        private static IResult GetUser(HttpContext http) =>
            Results.Ok(SessionPrincipalFactory.ToBffUser(http.User));

        private static async Task<IResult> LogoutAsync(
            HttpContext http, ApiAuthClient api, TokenRefreshService refresher, CancellationToken ct)
        {
            var auth = await http.AuthenticateAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            if (auth.Succeeded && auth.Properties!.Items.TryGetValue(SessionKeys.SessionKey, out var sessionKey) && sessionKey is not null)
            {
                try
                {
                    // revoke needs a valid access token, and the session's may have expired, so get a fresh one first.
                    var accessToken = await refresher.GetFreshAccessTokenAsync(sessionKey, ct);
                    if (accessToken is not null)
                        await api.RevokeAsync(accessToken, ct);
                }
                catch (HttpRequestException) { /* sign out locally even if the API is unreachable */ }

                refresher.Forget(sessionKey);
            }

            await http.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            return Results.NoContent();
        }
    }
}
