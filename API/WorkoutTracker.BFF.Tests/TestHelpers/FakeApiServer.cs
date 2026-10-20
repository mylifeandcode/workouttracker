using System.Net;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Hosting.Server;
using Microsoft.AspNetCore.Hosting.Server.Features;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace WorkoutTracker.BFF.Tests.TestHelpers
{
    /// <summary>What the fake API saw on a proxied request. This is how tests prove what the BFF did or did not forward.</summary>
    public record EchoSnapshot(string? Authorization, string? Cookie);

    /// <summary>
    /// A tiny in-process stand-in for the real API, listening on a real local port (YARP forwards over real sockets, so
    /// an in-memory test server would not do). It plays the auth endpoints the BFF calls and an Echo endpoint that reports
    /// the headers it received, and counts calls so tests can assert exactly how many refreshes the BFF made.
    /// </summary>
    public sealed class FakeApiServer : IAsyncDisposable
    {
        private readonly WebApplication _app;
        private int _loginCalls, _refreshCalls, _revokeCalls, _echoCalls, _refreshTokenSequence;

        private FakeApiServer(WebApplication app, string baseUrl)
        {
            _app = app;
            BaseUrl = baseUrl;
        }

        public string BaseUrl { get; }

        //Behaviour knobs, set per test.
        public TimeSpan LoginAccessTokenLifetime { get; set; } = TimeSpan.FromHours(2);
        public TimeSpan RefreshedAccessTokenLifetime { get; set; } = TimeSpan.FromHours(2);
        public TimeSpan RefreshDelay { get; set; } = TimeSpan.FromMilliseconds(150); //widens the window in which concurrent callers overlap
        public bool RejectRefresh { get; set; }
        public HttpStatusCode? RefreshFailsWith { get; set; }
        public HttpStatusCode RevokeStatus { get; set; } = HttpStatusCode.OK;

        //What the BFF did.
        public int LoginCalls => Volatile.Read(ref _loginCalls);
        public int RefreshCalls => Volatile.Read(ref _refreshCalls);
        public int RevokeCalls => Volatile.Read(ref _revokeCalls);
        public int EchoCalls => Volatile.Read(ref _echoCalls);
        public string? LastIssuedAccessToken { get; private set; }
        public string? LastRefreshRequestBody { get; private set; }
        public string? LastRevokeAuthorization { get; private set; }
        public EchoSnapshot? LastEcho { get; private set; }

        private record LoginBody(string Username, string Password);

        public static async Task<FakeApiServer> StartAsync()
        {
            var builder = WebApplication.CreateBuilder();
            builder.WebHost.UseUrls("http://127.0.0.1:0");
            builder.Logging.ClearProviders();

            var app = builder.Build();
            FakeApiServer? server = null;

            app.MapPost("/api/auth/login", (LoginBody body) => server!.Login(body));
            app.MapPost("/api/auth/refresh", (HttpRequest request) => server!.RefreshAsync(request));
            app.MapPost("/api/auth/revoke", (HttpRequest request) => server!.Revoke(request));
            app.MapMethods("/api/Echo", ["GET", "POST"], (HttpRequest request) => server!.Echo(request));
            app.MapGet("/api/Auth/profiles", (HttpRequest request) => server!.Echo(request)); //an anonymous route at the BFF

            await app.StartAsync();

            var address = app.Services.GetRequiredService<IServer>().Features.Get<IServerAddressesFeature>()!.Addresses.First();
            server = new FakeApiServer(app, address);
            return server;
        }

        private IResult Login(LoginBody body)
        {
            Interlocked.Increment(ref _loginCalls);

            if (body.Username == "nobody") return Results.NotFound();
            if (body.Password == "wrong") return Results.Unauthorized();

            var role = body.Username.StartsWith("admin", StringComparison.OrdinalIgnoreCase) ? "Administrator" : "Standard";
            return IssueTokens(LoginAccessTokenLifetime, body.Username, role);
        }

        private async Task<IResult> RefreshAsync(HttpRequest request)
        {
            Interlocked.Increment(ref _refreshCalls);

            using (var reader = new StreamReader(request.Body))
                LastRefreshRequestBody = await reader.ReadToEndAsync();

            await Task.Delay(RefreshDelay);

            if (RefreshFailsWith is { } failure) return Results.StatusCode((int)failure);
            if (RejectRefresh) return Results.Unauthorized();

            return IssueTokens(RefreshedAccessTokenLifetime, "refreshed-user", "Standard");
        }

        private IResult Revoke(HttpRequest request)
        {
            Interlocked.Increment(ref _revokeCalls);
            LastRevokeAuthorization = request.Headers.Authorization.ToString();
            return Results.StatusCode((int)RevokeStatus);
        }

        private IResult Echo(HttpRequest request)
        {
            Interlocked.Increment(ref _echoCalls);
            var snapshot = new EchoSnapshot(
                request.Headers.Authorization.Count > 0 ? request.Headers.Authorization.ToString() : null,
                request.Headers.Cookie.Count > 0 ? request.Headers.Cookie.ToString() : null);
            LastEcho = snapshot;
            return Results.Json(snapshot);
        }

        private IResult IssueTokens(TimeSpan lifetime, string name, string role)
        {
            var access = TestJwt.Create(lifetime, name: name, role: role);
            LastIssuedAccessToken = access;
            return Results.Json(new { accessToken = access, refreshToken = $"refresh-{Interlocked.Increment(ref _refreshTokenSequence)}" });
        }

        public async ValueTask DisposeAsync()
        {
            await _app.StopAsync();
            await _app.DisposeAsync();
        }
    }
}
