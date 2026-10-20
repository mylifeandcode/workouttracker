using System.Net;
using System.Text.Json;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Shouldly;
using WorkoutTracker.BFF.Auth;
using WorkoutTracker.BFF.Models;
using WorkoutTracker.BFF.Session;
using WorkoutTracker.BFF.Tests.TestHelpers;

namespace WorkoutTracker.BFF.Tests.Session
{
    [TestClass]
    public class TokenRefreshServiceTests
    {
        private const string RefreshPath = "/api/auth/refresh";

        private static readonly TimeSpan Fresh = TimeSpan.FromHours(2);
        private static readonly TimeSpan Expiring = TimeSpan.FromSeconds(10); //inside the 60s refresh window

        private MemoryTicketStore _store = null!;
        private RefreshLocks _locks = null!;

        [TestInitialize]
        public void Initialize()
        {
            _store = SessionTestHelper.CreateStore();
            _locks = new RefreshLocks();
        }

        private TokenRefreshService CreateSut(StubHttpHandler handler)
        {
            var api = new ApiAuthClient(new HttpClient(handler) { BaseAddress = new Uri("http://api.test/") });
            return new TokenRefreshService(_store, api, _locks, NullLogger<TokenRefreshService>.Instance);
        }

        private static StubHttpHandler HandlerThatRefreshesTo(string newAccess, string newRefresh, TimeSpan? delay = null) =>
            new(async _ =>
            {
                if (delay is not null) await Task.Delay(delay.Value);
                return StubHttpHandler.Json(HttpStatusCode.OK, new { accessToken = newAccess, refreshToken = newRefresh });
            });

        private static StubHttpHandler HandlerThatRespondsWith(HttpStatusCode status, TimeSpan? delay = null) =>
            new(async _ =>
            {
                if (delay is not null) await Task.Delay(delay.Value);
                return StubHttpHandler.Empty(status);
            });

        private Task<string> NewSession(TimeSpan accessTokenLifetime, string refreshToken = "refresh-1", string? accessToken = null) =>
            SessionTestHelper.StoreSessionAsync(_store, accessToken ?? TestJwt.Create(accessTokenLifetime), refreshToken);

        //WHEN A REFRESH IS NEEDED /////////////////////////////////////////////////////////////////////////////////////

        [TestMethod]
        public async Task Should_Return_Null_Without_Calling_The_Api_For_An_Unknown_Session()
        {
            var handler = HandlerThatRefreshesTo("x", "y");

            var result = await CreateSut(handler).GetFreshAccessTokenAsync("no-such-session", default);

            result.ShouldBeNull();
            handler.Requests.ShouldBeEmpty();
        }

        [TestMethod]
        public async Task Should_Return_The_Current_Token_Without_Calling_The_Api_When_It_Is_Not_Near_Expiry()
        {
            //ARRANGE
            var access = TestJwt.Create(Fresh);
            var key = await NewSession(Fresh, accessToken: access);
            var handler = HandlerThatRefreshesTo("x", "y");

            //ACT
            var result = await CreateSut(handler).GetFreshAccessTokenAsync(key, default);

            //ASSERT
            result.ShouldBe(access);
            handler.Requests.ShouldBeEmpty();
        }

        [TestMethod]
        public async Task Should_Not_Refresh_A_Token_Just_Outside_The_Window()
        {
            var key = await NewSession(TokenRefreshService.RefreshWindow + TimeSpan.FromSeconds(30));
            var handler = HandlerThatRefreshesTo("x", "y");

            await CreateSut(handler).GetFreshAccessTokenAsync(key, default);

            handler.CallsTo(RefreshPath).ShouldBe(0);
        }

        [TestMethod]
        public async Task Should_Refresh_A_Token_Just_Inside_The_Window()
        {
            var key = await NewSession(TokenRefreshService.RefreshWindow - TimeSpan.FromSeconds(30));
            var handler = HandlerThatRefreshesTo("new-access", "new-refresh");

            await CreateSut(handler).GetFreshAccessTokenAsync(key, default);

            handler.CallsTo(RefreshPath).ShouldBe(1);
        }

        [TestMethod]
        public async Task Should_Refresh_A_Token_That_Has_Already_Expired()
        {
            var key = await NewSession(TimeSpan.FromMinutes(-5));
            var handler = HandlerThatRefreshesTo("new-access", "new-refresh");

            var result = await CreateSut(handler).GetFreshAccessTokenAsync(key, default);

            result.ShouldBe("new-access");
        }

        [TestMethod]
        public void Should_Report_Expiry_Relative_To_The_Refresh_Window()
        {
            TokenRefreshService.IsExpiring(TestJwt.Create(Fresh)).ShouldBeFalse();
            TokenRefreshService.IsExpiring(TestJwt.Create(Expiring)).ShouldBeTrue();
            TokenRefreshService.IsExpiring(TestJwt.Create(TimeSpan.FromMinutes(-1))).ShouldBeTrue();
        }

        //WHAT A SUCCESSFUL REFRESH DOES ///////////////////////////////////////////////////////////////////////////////

        [TestMethod]
        public async Task Should_Send_Both_Current_Tokens_To_The_Api_And_Store_The_Rotated_Pair()
        {
            //ARRANGE
            var oldAccess = TestJwt.Create(Expiring);
            var key = await NewSession(Expiring, refreshToken: "refresh-1", accessToken: oldAccess);
            var handler = HandlerThatRefreshesTo("new-access", "refresh-2");

            //ACT
            var result = await CreateSut(handler).GetFreshAccessTokenAsync(key, default);

            //ASSERT
            result.ShouldBe("new-access");
            _store.GetTokens(key).ShouldBe(new AuthTokens("new-access", "refresh-2"));

            var request = handler.Requests.Single();
            request.Method.ShouldBe("POST");
            request.Path.ShouldBe(RefreshPath);
            using var body = JsonDocument.Parse(request.Body);
            body.RootElement.GetProperty("accessToken").GetString().ShouldBe(oldAccess);
            body.RootElement.GetProperty("refreshToken").GetString().ShouldBe("refresh-1");
        }

        [TestMethod]
        public async Task Should_Not_Refresh_Again_On_The_Next_Request_Once_The_New_Token_Is_Fresh()
        {
            var key = await NewSession(Expiring);
            var handler = HandlerThatRefreshesTo(TestJwt.Create(Fresh), "refresh-2");
            var sut = CreateSut(handler);

            await sut.GetFreshAccessTokenAsync(key, default);
            await sut.GetFreshAccessTokenAsync(key, default);

            handler.CallsTo(RefreshPath).ShouldBe(1);
        }

        //WHEN THE REFRESH FAILS ///////////////////////////////////////////////////////////////////////////////////////

        //The API says the pair is no good (expired, revoked, replayed): the session is dead and must go.
        [TestMethod]
        [DataRow(HttpStatusCode.Unauthorized)]
        [DataRow(HttpStatusCode.BadRequest)]
        public async Task Should_End_The_Session_When_The_Api_Rejects_The_Refresh_Token(HttpStatusCode status)
        {
            var key = await NewSession(Expiring);
            var handler = HandlerThatRespondsWith(status);

            var result = await CreateSut(handler).GetFreshAccessTokenAsync(key, default);

            result.ShouldBeNull();
            _store.GetTokens(key).ShouldBeNull();
            (await _store.RetrieveAsync(key)).ShouldBeNull();
        }

        //The API is unreachable or broken: that says nothing about the user's session, so it must survive to retry.
        [TestMethod]
        [DataRow(HttpStatusCode.InternalServerError)]
        [DataRow(HttpStatusCode.BadGateway)]
        [DataRow(HttpStatusCode.ServiceUnavailable)]
        [DataRow(HttpStatusCode.NotFound)]
        public async Task Should_Keep_The_Session_And_Throw_When_The_Api_Fails_For_Another_Reason(HttpStatusCode status)
        {
            var access = TestJwt.Create(Expiring);
            var key = await NewSession(Expiring, accessToken: access);
            var handler = HandlerThatRespondsWith(status);

            await Should.ThrowAsync<HttpRequestException>(() => CreateSut(handler).GetFreshAccessTokenAsync(key, default));

            _store.GetTokens(key).ShouldBe(new AuthTokens(access, "refresh-1"));
        }

        [TestMethod]
        public async Task Should_Keep_The_Session_And_Throw_When_The_Api_Cannot_Be_Reached_At_All()
        {
            var access = TestJwt.Create(Expiring);
            var key = await NewSession(Expiring, accessToken: access);
            var handler = new StubHttpHandler(_ => throw new HttpRequestException("connection refused"));

            await Should.ThrowAsync<HttpRequestException>(() => CreateSut(handler).GetFreshAccessTokenAsync(key, default));

            _store.GetTokens(key).ShouldBe(new AuthTokens(access, "refresh-1"));
        }

        [TestMethod]
        public async Task Should_Succeed_On_A_Later_Attempt_After_A_Transient_Failure()
        {
            var key = await NewSession(Expiring);
            var failing = true;
            var handler = new StubHttpHandler(_ => Task.FromResult(failing
                ? StubHttpHandler.Empty(HttpStatusCode.ServiceUnavailable)
                : StubHttpHandler.Json(HttpStatusCode.OK, new { accessToken = "new-access", refreshToken = "refresh-2" })));
            var sut = CreateSut(handler);

            await Should.ThrowAsync<HttpRequestException>(() => sut.GetFreshAccessTokenAsync(key, default));
            failing = false;
            var result = await sut.GetFreshAccessTokenAsync(key, default);

            result.ShouldBe("new-access");
        }

        //SINGLE-FLIGHT ////////////////////////////////////////////////////////////////////////////////////////////////

        /*
        The API rotates the refresh token on every use and revokes the whole chain if an old one is presented again. So when
        a page fires several requests at once with an expiring token, exactly ONE may refresh; the others must wait and reuse
        the result. The stub API answers slowly so the callers genuinely overlap.
        */
        [TestMethod]
        public async Task Should_Make_Exactly_One_Refresh_Call_For_Many_Simultaneous_Requests()
        {
            //ARRANGE
            var key = await NewSession(Expiring);
            var newAccess = TestJwt.Create(Fresh);
            var handler = HandlerThatRefreshesTo(newAccess, "refresh-2", delay: TimeSpan.FromMilliseconds(200));
            var sut = CreateSut(handler);

            //ACT
            var results = await Task.WhenAll(Enumerable.Range(0, 10).Select(_ => Task.Run(() => sut.GetFreshAccessTokenAsync(key, default))));

            //ASSERT
            handler.CallsTo(RefreshPath).ShouldBe(1);
            results.ShouldAllBe(token => token == newAccess);
            _store.GetTokens(key).ShouldBe(new AuthTokens(newAccess, "refresh-2"));
        }

        [TestMethod]
        public async Task Should_Make_One_Refresh_Call_And_End_The_Session_For_Everyone_When_The_Refresh_Is_Rejected()
        {
            var key = await NewSession(Expiring);
            var handler = HandlerThatRespondsWith(HttpStatusCode.Unauthorized, delay: TimeSpan.FromMilliseconds(200));
            var sut = CreateSut(handler);

            var results = await Task.WhenAll(Enumerable.Range(0, 10).Select(_ => Task.Run(() => sut.GetFreshAccessTokenAsync(key, default))));

            //The first caller learns the session is dead and removes it; the rest find it gone instead of presenting the dead token again.
            handler.CallsTo(RefreshPath).ShouldBe(1);
            results.ShouldAllBe(token => token == null);
        }

        [TestMethod]
        public async Task Should_Refresh_Different_Sessions_Independently()
        {
            var first = await NewSession(Expiring, refreshToken: "refresh-a");
            var second = await NewSession(Expiring, refreshToken: "refresh-b");
            var handler = HandlerThatRefreshesTo(TestJwt.Create(Fresh), "rotated", delay: TimeSpan.FromMilliseconds(100));
            var sut = CreateSut(handler);

            await Task.WhenAll(sut.GetFreshAccessTokenAsync(first, default), sut.GetFreshAccessTokenAsync(second, default));

            handler.CallsTo(RefreshPath).ShouldBe(2);
        }

        [TestMethod]
        public async Task Should_Not_Refresh_For_A_Caller_Cancelled_While_Waiting_Its_Turn()
        {
            //ARRANGE: the first caller holds the lock while the slow refresh runs
            var key = await NewSession(Expiring);
            var handler = HandlerThatRefreshesTo(TestJwt.Create(Fresh), "refresh-2", delay: TimeSpan.FromMilliseconds(400));
            var sut = CreateSut(handler);
            var first = sut.GetFreshAccessTokenAsync(key, default);
            await Task.Delay(50);

            //ACT: a second caller gives up before getting the lock
            using var cancel = new CancellationTokenSource(TimeSpan.FromMilliseconds(50));
            await Should.ThrowAsync<OperationCanceledException>(() => sut.GetFreshAccessTokenAsync(key, cancel.Token));
            await first;

            //ASSERT
            handler.CallsTo(RefreshPath).ShouldBe(1);
        }
    }
}
