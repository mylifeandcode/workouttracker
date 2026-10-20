namespace WorkoutTracker.BFF.Middleware
{
    /// <summary>
    /// Cookies are sent automatically by the browser, so (unlike the old bearer-token setup) a malicious site could
    /// make the browser fire requests at us. SameSite=Strict is the first defence; this is the second: state-changing
    /// requests must carry a custom header. A cross-site form post or simple fetch cannot set one without triggering a
    /// CORS preflight, which we never approve. Applies to login too, to prevent login CSRF.
    /// </summary>
    public class CsrfProtectionMiddleware
    {
        public const string HeaderName = "X-CSRF";
        public const string HeaderValue = "1";

        private readonly RequestDelegate _next;

        public CsrfProtectionMiddleware(RequestDelegate next)
        {
            _next = next ?? throw new ArgumentNullException(nameof(next));
        }

        public async Task InvokeAsync(HttpContext context)
        {
            if (RequiresCheck(context.Request) && context.Request.Headers[HeaderName] != HeaderValue)
            {
                context.Response.StatusCode = StatusCodes.Status403Forbidden;
                return;
            }

            await _next(context);
        }

        private static bool RequiresCheck(HttpRequest request) =>
            !HttpMethods.IsGet(request.Method)
            && !HttpMethods.IsHead(request.Method)
            && !HttpMethods.IsOptions(request.Method)
            && !HttpMethods.IsTrace(request.Method)
            && (request.Path.StartsWithSegments("/api") || request.Path.StartsWithSegments("/bff"));
    }
}
