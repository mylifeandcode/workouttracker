using System.Collections.Concurrent;
using System.Net;
using System.Net.Http.Json;

namespace WorkoutTracker.BFF.Tests.TestHelpers
{
    public record RecordedRequest(string Method, string Path, string Body);

    /// <summary>
    /// Stands in for the API at the HTTP level, so ApiAuthClient's real request building and status-code handling run
    /// under test. (ApiAuthClient is a concrete class with non-virtual methods, so a handler is the seam, not a mock.)
    /// </summary>
    public sealed class StubHttpHandler : HttpMessageHandler
    {
        private readonly Func<HttpRequestMessage, Task<HttpResponseMessage>> _respond;
        private readonly ConcurrentQueue<RecordedRequest> _requests = new();

        public StubHttpHandler(Func<HttpRequestMessage, Task<HttpResponseMessage>> respond)
        {
            _respond = respond;
        }

        public IReadOnlyCollection<RecordedRequest> Requests => _requests.ToArray();

        public int CallsTo(string path) =>
            _requests.Count(r => r.Path.Equals(path, StringComparison.OrdinalIgnoreCase));

        protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {
            var body = request.Content is null ? string.Empty : await request.Content.ReadAsStringAsync(cancellationToken);
            _requests.Enqueue(new RecordedRequest(request.Method.Method, request.RequestUri!.AbsolutePath, body));

            return await _respond(request);
        }

        public static HttpResponseMessage Json(HttpStatusCode status, object body) =>
            new(status) { Content = JsonContent.Create(body) };

        public static HttpResponseMessage Empty(HttpStatusCode status) => new(status);
    }
}
