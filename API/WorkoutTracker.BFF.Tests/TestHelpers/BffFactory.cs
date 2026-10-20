using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;

namespace WorkoutTracker.BFF.Tests.TestHelpers
{
    /// <summary>Hosts the real BFF pipeline in-process, pointed at a FakeApiServer.</summary>
    public sealed class BffFactory : WebApplicationFactory<Program>
    {
        private readonly string _apiBaseUrl;

        public BffFactory(string apiBaseUrl)
        {
            _apiBaseUrl = apiBaseUrl;
        }

        protected override void ConfigureWebHost(IWebHostBuilder builder)
        {
            //UseSetting (unlike ConfigureAppConfiguration) is applied early enough for Program.cs, which reads Api:BaseUrl
            //immediately while building the host.
            builder.UseSetting("Api:BaseUrl", _apiBaseUrl);
            builder.UseEnvironment("Development");
        }

        /// <summary>
        /// A browser stand-in: it keeps cookies between requests, like a real browser, and sends the CSRF header the SPA's
        /// interceptor adds. Pass <paramref name="sendCsrfHeader"/> false to behave like a cross-site request.
        /// </summary>
        public HttpClient CreateBrowser(bool handleCookies = true, bool sendCsrfHeader = true)
        {
            var client = CreateClient(new WebApplicationFactoryClientOptions
            {
                AllowAutoRedirect = false,
                HandleCookies = handleCookies,
                BaseAddress = new Uri("http://localhost")
            });

            if (sendCsrfHeader)
                client.DefaultRequestHeaders.Add("X-CSRF", "1");

            return client;
        }
    }
}
