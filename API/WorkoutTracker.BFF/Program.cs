using Microsoft.Extensions.Http.Resilience;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.HttpOverrides;
using WorkoutTracker.BFF.Auth;
using WorkoutTracker.BFF.Endpoints;
using WorkoutTracker.BFF.Middleware;
using WorkoutTracker.BFF.Proxy;
using WorkoutTracker.BFF.Session;

var builder = WebApplication.CreateBuilder(args);

builder.AddServiceDefaults();

var apiBaseUrl = builder.Configuration["Api:BaseUrl"]
    ?? throw new InvalidOperationException("Api:BaseUrl is not configured.");

builder.Services.AddMemoryCache();
builder.Services.AddSingleton<MemoryTicketStore>();
builder.Services.AddSingleton<ITicketStore>(sp => sp.GetRequiredService<MemoryTicketStore>());
builder.Services.AddSingleton<RefreshLocks>();
builder.Services.AddScoped<TokenRefreshService>();

// Cookie session: the only credential the browser ever holds. HttpOnly keeps it away from JavaScript, SameSite=Strict
// stops it being sent on cross-site requests. The cookie value is just a session key into MemoryTicketStore.
builder.Services
    .AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(options =>
    {
        options.Cookie.Name = "wt.session";
        options.Cookie.HttpOnly = true;
        options.Cookie.SameSite = SameSiteMode.Strict;
        options.Cookie.SecurePolicy = CookieSecurePolicy.SameAsRequest; // plain http in local dev; behind TLS it is Secure
        options.ExpireTimeSpan = TimeSpan.FromDays(7); // matches Jwt:RefreshTokenLifetimeDays
        options.SlidingExpiration = true;

        // This is an API-style surface: answer 401/403 instead of redirecting to a login page.
        options.Events.OnRedirectToLogin = context =>
        {
            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            return Task.CompletedTask;
        };
        options.Events.OnRedirectToAccessDenied = context =>
        {
            context.Response.StatusCode = StatusCodes.Status403Forbidden;
            return Task.CompletedTask;
        };
    });

builder.Services
    .AddOptions<CookieAuthenticationOptions>(CookieAuthenticationDefaults.AuthenticationScheme)
    .Configure<ITicketStore>((options, store) => options.SessionStore = store);

builder.Services.AddAuthorization();

// ServiceDefaults gives every HttpClient a standard resilience handler that retries failed requests, POSTs included.
// Retrying a POST is unsafe here: if /auth/refresh succeeded but the response was lost, the retry would present an
// already-rotated refresh token and the API would revoke the whole chain. Keep the timeouts and circuit breaker, but
// never retry unsafe methods. ConfigureAll is fine because this is the BFF's only factory-created HttpClient.
builder.Services.ConfigureAll<HttpStandardResilienceOptions>(options => options.Retry.DisableForUnsafeHttpMethods());

builder.Services.AddHttpClient<ApiAuthClient>(client => client.BaseAddress = new Uri(apiBaseUrl));

builder.Services.AddApiProxy(apiBaseUrl);

builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto | ForwardedHeaders.XForwardedHost;
    // Home network: trust the reverse proxy (nginx / Angular dev server) in front of us.
    options.KnownIPNetworks.Clear();
    options.KnownProxies.Clear();
});

var app = builder.Build();

app.UseForwardedHeaders();
app.UseMiddleware<CsrfProtectionMiddleware>();
app.UseAuthentication();
app.UseAuthorization();

// Only requests that will talk to the API need a fresh token. /bff/user is included so that a session whose refresh
// token has died reports 401 immediately instead of looking logged-in until the first API call fails.
app.UseWhen(
    context => context.Request.Path.StartsWithSegments("/api") || context.Request.Path.StartsWithSegments("/bff/user"),
    branch => branch.UseMiddleware<TokenRefreshMiddleware>());

app.MapBffEndpoints();

// The BFF owns login/refresh/revoke (see BffEndpoints), so the browser must not reach the API's versions of them.
// This literal-ish route is more specific than the proxy's catch-all, so it wins.
app.Map("/api/auth/{action:regex(^(login|refresh|revoke)$)}", () => Results.NotFound());

app.MapReverseProxy();
app.MapDefaultEndpoints();

app.Run();

// Top-level statements generate an internal Program class; this makes it visible to WebApplicationFactory<Program> in
// WorkoutTracker.BFF.Tests so the real pipeline can be tested end to end.
public partial class Program;
