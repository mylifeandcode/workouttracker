using Microsoft.AspNetCore.Http;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Shouldly;
using WorkoutTracker.BFF.Middleware;

namespace WorkoutTracker.BFF.Tests.Middleware
{
    [TestClass]
    public class CsrfProtectionMiddlewareTests
    {
        private static async Task<(bool NextCalled, int StatusCode)> InvokeAsync(string method, string path, string? csrfHeader)
        {
            var nextCalled = false;
            var sut = new CsrfProtectionMiddleware(_ => { nextCalled = true; return Task.CompletedTask; });

            var context = new DefaultHttpContext();
            context.Request.Method = method;
            context.Request.Path = path;
            if (csrfHeader is not null)
                context.Request.Headers[CsrfProtectionMiddleware.HeaderName] = csrfHeader;

            await sut.InvokeAsync(context);
            return (nextCalled, context.Response.StatusCode);
        }

        //State-changing requests to the BFF's own surface without the header must be refused, and never reach the pipeline.
        [TestMethod]
        [DataRow("POST", "/api/Exercises")]
        [DataRow("PUT", "/api/Exercises/5")]
        [DataRow("PATCH", "/api/Exercises/5")]
        [DataRow("DELETE", "/api/Exercises/5")]
        [DataRow("POST", "/bff/login")]
        [DataRow("POST", "/bff/logout")]
        [DataRow("post", "/api/Exercises")]
        [DataRow("POST", "/API/Exercises")]
        public async Task Should_Reject_A_State_Changing_Request_Without_The_Header(string method, string path)
        {
            var (nextCalled, statusCode) = await InvokeAsync(method, path, csrfHeader: null);

            statusCode.ShouldBe(StatusCodes.Status403Forbidden);
            nextCalled.ShouldBeFalse();
        }

        [TestMethod]
        [DataRow("POST", "/api/Exercises")]
        [DataRow("PUT", "/api/Exercises/5")]
        [DataRow("DELETE", "/api/Exercises/5")]
        [DataRow("POST", "/bff/login")]
        [DataRow("POST", "/bff/logout")]
        public async Task Should_Allow_A_State_Changing_Request_That_Carries_The_Header(string method, string path)
        {
            var (nextCalled, statusCode) = await InvokeAsync(method, path, CsrfProtectionMiddleware.HeaderValue);

            nextCalled.ShouldBeTrue();
            statusCode.ShouldBe(StatusCodes.Status200OK);
        }

        [TestMethod]
        [DataRow("")]
        [DataRow("0")]
        [DataRow("true")]
        [DataRow("yes")]
        public async Task Should_Reject_A_Request_Whose_Header_Has_The_Wrong_Value(string value)
        {
            var (nextCalled, statusCode) = await InvokeAsync("POST", "/api/Exercises", value);

            statusCode.ShouldBe(StatusCodes.Status403Forbidden);
            nextCalled.ShouldBeFalse();
        }

        //Safe methods cannot change state, so they need no header (and the browser's own navigations could never send one).
        [TestMethod]
        [DataRow("GET", "/api/Exercises")]
        [DataRow("GET", "/bff/user")]
        [DataRow("HEAD", "/api/Exercises")]
        [DataRow("OPTIONS", "/api/Exercises")]
        [DataRow("TRACE", "/api/Exercises")]
        public async Task Should_Not_Require_The_Header_On_A_Safe_Method(string method, string path)
        {
            var (nextCalled, _) = await InvokeAsync(method, path, csrfHeader: null);

            nextCalled.ShouldBeTrue();
        }

        //The check only guards the BFF's own surface; anything else (health checks, static files) is not its business.
        [TestMethod]
        [DataRow("POST", "/health")]
        [DataRow("POST", "/alive")]
        [DataRow("POST", "/")]
        [DataRow("POST", "/apiary")]
        [DataRow("POST", "/bffx/login")]
        public async Task Should_Not_Require_The_Header_Outside_Api_And_Bff_Paths(string method, string path)
        {
            var (nextCalled, _) = await InvokeAsync(method, path, csrfHeader: null);

            nextCalled.ShouldBeTrue();
        }
    }
}
