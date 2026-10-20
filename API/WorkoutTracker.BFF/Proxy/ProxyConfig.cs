using System.Net.Http.Headers;
using Yarp.ReverseProxy.Configuration;
using Yarp.ReverseProxy.Transforms;
using WorkoutTracker.BFF.Session;

namespace WorkoutTracker.BFF.Proxy
{
    /// <summary>Everything under /api is forwarded to the API, with the session's bearer token attached server-side.</summary>
    public static class ProxyConfig
    {
        private const string ClusterId = "api";

        // YARP's built-in policy names. "default" = must be authenticated (cookie session); "anonymous" = open.
        private const string Authenticated = "default";
        private const string Anonymous = "anonymous";

        public static IReverseProxyBuilder AddApiProxy(this IServiceCollection services, string apiBaseUrl) =>
            services.AddReverseProxy()
                .LoadFromMemory(Routes(), Clusters(apiBaseUrl))
                .AddTransforms(context => context.AddRequestTransform(AttachSessionToken));

        // Routes are code, not appsettings, so the API address has a single source (Api:BaseUrl).
        // The most specific route wins, so the anonymous routes override the authenticated catch-all.
        private static IReadOnlyList<RouteConfig> Routes() =>
        [
            Route("auth-profiles", "/api/auth/profiles", Anonymous),
            Route("auth-request-password-reset", "/api/auth/request-password-reset", Anonymous),
            Route("auth-reset-password", "/api/auth/reset-password", Anonymous),
            Route("auth-validate-reset-code", "/api/auth/validate-reset-code/{**code}", Anonymous),
            Route("users-register", "/api/users/new", Anonymous),
            Route("api-catch-all", "/api/{**catch-all}", Authenticated)
        ];

        private static IReadOnlyList<ClusterConfig> Clusters(string apiBaseUrl) =>
        [
            new ClusterConfig
            {
                ClusterId = ClusterId,
                Destinations = new Dictionary<string, DestinationConfig>
                {
                    ["primary"] = new() { Address = apiBaseUrl }
                }
            }
        ];

        private static RouteConfig Route(string id, string path, string policy) => new()
        {
            RouteId = id,
            ClusterId = ClusterId,
            AuthorizationPolicy = policy,
            Match = new RouteMatch { Path = path }
        };

        private static ValueTask AttachSessionToken(RequestTransformContext context)
        {
            var headers = context.ProxyRequest.Headers;

            // The session cookie is the BFF's own credential; the API must never see it.
            headers.Remove("Cookie");

            // Never trust an Authorization header from the browser: use the session's token, or none.
            headers.Authorization =
                context.HttpContext.Items[SessionKeys.FreshAccessTokenItem] is string token
                    ? new AuthenticationHeaderValue("Bearer", token)
                    : null;

            return ValueTask.CompletedTask;
        }
    }
}
