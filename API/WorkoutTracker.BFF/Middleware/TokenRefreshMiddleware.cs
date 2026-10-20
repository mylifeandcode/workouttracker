using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using WorkoutTracker.BFF.Session;

namespace WorkoutTracker.BFF.Middleware
{
    /// <summary>
    /// For an authenticated session, makes sure the API access token is fresh and parks it in HttpContext.Items for
    /// the proxy transform to attach. Runs before the proxy so a dead session can be answered here with a 401.
    /// </summary>
    public class TokenRefreshMiddleware
    {
        private readonly RequestDelegate _next;

        public TokenRefreshMiddleware(RequestDelegate next)
        {
            _next = next ?? throw new ArgumentNullException(nameof(next));
        }

        public async Task InvokeAsync(HttpContext context, TokenRefreshService refresher, ILogger<TokenRefreshMiddleware> logger)
        {
            if (context.User.Identity?.IsAuthenticated != true)
            {
                await _next(context); // anonymous route (or about to be rejected by authorization): nothing to attach
                return;
            }

            var auth = await context.AuthenticateAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            auth.Properties!.Items.TryGetValue(SessionKeys.SessionKey, out var sessionKey);

            string? accessToken = null;
            if (sessionKey is not null)
            {
                try
                {
                    accessToken = await refresher.GetFreshAccessTokenAsync(sessionKey, context.RequestAborted);
                }
                catch (HttpRequestException ex)
                {
                    // The API is down or erroring: the session may be fine, so keep it and ask the client to retry.
                    logger.LogWarning(ex, "Could not refresh the access token; API unavailable.");
                    context.Response.StatusCode = StatusCodes.Status503ServiceUnavailable;
                    return;
                }
            }

            if (accessToken is null)
            {
                // Session is gone or its refresh token was rejected. SignOut also deletes the browser's cookie.
                await context.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
                context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                return;
            }

            context.Items[SessionKeys.FreshAccessTokenItem] = accessToken;
            await _next(context);
        }
    }
}
