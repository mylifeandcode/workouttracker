using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Shouldly;
using WorkoutTracker.BFF.Models;
using WorkoutTracker.BFF.Tests.TestHelpers;

namespace WorkoutTracker.BFF.Tests.Endpoints
{
    /// <summary>
    /// The real BFF pipeline (cookie session, CSRF check, refresh middleware, YARP) hosted in-process and pointed at a fake
    /// API. Each test drives a "browser" (an HttpClient that keeps cookies) and checks both the response and what the fake
    /// API actually received, which is the only way to prove what the BFF did or did not forward.
    /// </summary>
    [TestClass]
    public class BffEndToEndTests
    {
        private const string PublicId = "b6e3f2a0-5b1c-4c8e-9a53-2d7a1c0f4e11"; //TestJwt's default

        private FakeApiServer _api = null!;
        private BffFactory _factory = null!;

        [TestInitialize]
        public async Task Initialize()
        {
            _api = await FakeApiServer.StartAsync();
            _factory = new BffFactory(_api.BaseUrl);
        }

        [TestCleanup]
        public async Task Cleanup()
        {
            await _factory.DisposeAsync();
            await _api.DisposeAsync();
        }

        private static Task<HttpResponseMessage> LogInAsync(HttpClient browser, string user = "alan", string password = "pw") =>
            browser.PostAsJsonAsync("/bff/login", new { username = user, password });

        private static string? SessionCookieValue(HttpResponseMessage response)
        {
            if (!response.Headers.TryGetValues("Set-Cookie", out var values)) return null;
            var header = values.FirstOrDefault(v => v.StartsWith("wt.session=", StringComparison.Ordinal));
            return header?.Split(';')[0]["wt.session=".Length..];
        }

        /// <summary>A second browser that presents a copied session cookie, as an attacker holding a stolen cookie would.</summary>
        private HttpClient BrowserReplaying(string cookieValue)
        {
            var browser = _factory.CreateBrowser(handleCookies: false);
            browser.DefaultRequestHeaders.Add("Cookie", $"wt.session={cookieValue}");
            return browser;
        }

        /// <summary>Like <see cref="BrowserReplaying"/>, but also without the CSRF header: what a cross-site request looks like.</summary>
        private HttpClient CrossSiteBrowserReplaying(string cookieValue)
        {
            var browser = _factory.CreateBrowser(handleCookies: false, sendCsrfHeader: false);
            browser.DefaultRequestHeaders.Add("Cookie", $"wt.session={cookieValue}");
            return browser;
        }

        private async Task<HttpClient> SignedInBrowserAsync(string user = "alan")
        {
            var browser = _factory.CreateBrowser();
            (await LogInAsync(browser, user)).StatusCode.ShouldBe(HttpStatusCode.OK);
            return browser;
        }

        //LOGIN ////////////////////////////////////////////////////////////////////////////////////////////////////////

        [TestMethod]
        public async Task Should_Log_In_And_Return_The_User_But_No_Token()
        {
            //ARRANGE
            var browser = _factory.CreateBrowser();

            //ACT
            var response = await LogInAsync(browser, "alan");
            var body = await response.Content.ReadAsStringAsync();

            //ASSERT
            response.StatusCode.ShouldBe(HttpStatusCode.OK);
            var user = JsonSerializer.Deserialize<BffUser>(body, JsonSerializerOptions.Web);
            user.ShouldBe(new BffUser("alan", false, 7, Guid.Parse(PublicId)));
            body.ShouldNotContain("eyJ"); //no JWT ...
            body.ShouldNotContain("refresh"); //... and no refresh token, in any form
            _api.LoginCalls.ShouldBe(1);
        }

        [TestMethod]
        public async Task Should_Report_An_Administrator_As_Such()
        {
            var browser = _factory.CreateBrowser();

            var response = await LogInAsync(browser, "admin-alan");

            (await response.Content.ReadFromJsonAsync<BffUser>())!.IsAdmin.ShouldBeTrue();
        }

        [TestMethod]
        public async Task Should_Set_An_HttpOnly_SameSite_Strict_Session_Cookie_That_Is_Not_A_Token()
        {
            var browser = _factory.CreateBrowser();

            var response = await LogInAsync(browser);

            var setCookie = response.Headers.GetValues("Set-Cookie").Single(v => v.StartsWith("wt.session=")).ToLowerInvariant();
            setCookie.ShouldContain("httponly");
            setCookie.ShouldContain("samesite=strict");
            setCookie.ShouldContain("path=/");
            SessionCookieValue(response)!.ShouldNotContain("eyJ"); //it names a server-side session; it is not itself a JWT
        }

        [TestMethod]
        public async Task Should_Mark_The_Cookie_Secure_When_A_Proxy_Says_The_Browser_Used_Https()
        {
            var browser = _factory.CreateBrowser();
            using var request = new HttpRequestMessage(HttpMethod.Post, "/bff/login") { Content = JsonContent.Create(new { username = "alan", password = "pw" }) };
            request.Headers.Add("X-Forwarded-Proto", "https");

            var response = await browser.SendAsync(request);

            response.Headers.GetValues("Set-Cookie").Single(v => v.StartsWith("wt.session=")).ToLowerInvariant().ShouldContain("secure");
        }

        [TestMethod]
        public async Task Should_Pass_Through_The_Apis_Rejection_Of_An_Unknown_User_And_Set_No_Cookie()
        {
            var browser = _factory.CreateBrowser();

            var response = await LogInAsync(browser, "nobody");

            response.StatusCode.ShouldBe(HttpStatusCode.NotFound);
            SessionCookieValue(response).ShouldBeNull();
        }

        [TestMethod]
        public async Task Should_Pass_Through_The_Apis_Rejection_Of_A_Wrong_Password_And_Set_No_Cookie()
        {
            var browser = _factory.CreateBrowser();

            var response = await LogInAsync(browser, "alan", "wrong");

            response.StatusCode.ShouldBe(HttpStatusCode.Unauthorized);
            SessionCookieValue(response).ShouldBeNull();
        }

        [TestMethod]
        public async Task Should_Refuse_A_Login_That_Lacks_The_Csrf_Header_Without_Reaching_The_Api()
        {
            var crossSiteBrowser = _factory.CreateBrowser(sendCsrfHeader: false);

            var response = await LogInAsync(crossSiteBrowser);

            response.StatusCode.ShouldBe(HttpStatusCode.Forbidden);
            _api.LoginCalls.ShouldBe(0);
        }

        //WHO AM I ///////////////////////////////////////////////////////////////////////////////////////////////////

        [TestMethod]
        public async Task Should_Answer_401_Not_A_Redirect_To_Whoever_Has_No_Session()
        {
            var browser = _factory.CreateBrowser();

            var response = await browser.GetAsync("/bff/user");

            response.StatusCode.ShouldBe(HttpStatusCode.Unauthorized);
        }

        [TestMethod]
        public async Task Should_Tell_A_Signed_In_Browser_Who_It_Is()
        {
            var browser = await SignedInBrowserAsync("alan");

            var response = await browser.GetAsync("/bff/user");

            response.StatusCode.ShouldBe(HttpStatusCode.OK);
            (await response.Content.ReadFromJsonAsync<BffUser>())!.UserName.ShouldBe("alan");
        }

        //THE PROXY ////////////////////////////////////////////////////////////////////////////////////////////////////

        [TestMethod]
        public async Task Should_Attach_The_Sessions_Bearer_Token_To_A_Proxied_Call()
        {
            var browser = await SignedInBrowserAsync();

            var response = await browser.GetAsync("/api/Echo");

            response.StatusCode.ShouldBe(HttpStatusCode.OK);
            _api.LastEcho!.Authorization.ShouldBe($"Bearer {_api.LastIssuedAccessToken}");
        }

        [TestMethod]
        public async Task Should_Replace_An_Authorization_Header_The_Browser_Supplies_With_The_Sessions_Own()
        {
            var browser = await SignedInBrowserAsync();
            using var request = new HttpRequestMessage(HttpMethod.Get, "/api/Echo");
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", "forged-by-the-browser");

            await browser.SendAsync(request);

            _api.LastEcho!.Authorization.ShouldBe($"Bearer {_api.LastIssuedAccessToken}");
            _api.LastEcho.Authorization.ShouldNotContain("forged");
        }

        [TestMethod]
        public async Task Should_Never_Forward_The_Session_Cookie_To_The_Api()
        {
            var browser = await SignedInBrowserAsync();

            await browser.GetAsync("/api/Echo");

            _api.LastEcho!.Cookie.ShouldBeNull();
        }

        [TestMethod]
        public async Task Should_Refuse_A_Proxied_Call_With_No_Session_Without_Reaching_The_Api()
        {
            var browser = _factory.CreateBrowser();

            var response = await browser.GetAsync("/api/Echo");

            response.StatusCode.ShouldBe(HttpStatusCode.Unauthorized);
            _api.EchoCalls.ShouldBe(0);
        }

        [TestMethod]
        public async Task Should_Let_An_Anonymous_Route_Through_Without_A_Session()
        {
            var browser = _factory.CreateBrowser();

            var response = await browser.GetAsync("/api/Auth/profiles");

            response.StatusCode.ShouldBe(HttpStatusCode.OK);
            _api.EchoCalls.ShouldBe(1);
        }

        [TestMethod]
        public async Task Should_Strip_A_Forged_Authorization_Header_From_An_Anonymous_Route()
        {
            var browser = _factory.CreateBrowser();
            using var request = new HttpRequestMessage(HttpMethod.Get, "/api/Auth/profiles");
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", "forged-by-the-browser");

            await browser.SendAsync(request);

            _api.LastEcho!.Authorization.ShouldBeNull();
        }

        [TestMethod]
        public async Task Should_Refuse_A_State_Changing_Proxied_Call_That_Lacks_The_Csrf_Header_Even_With_A_Valid_Session()
        {
            //ARRANGE: a valid session cookie, presented by a request without the CSRF header
            var cookie = SessionCookieValue(await LogInAsync(_factory.CreateBrowser()))!;
            var crossSite = CrossSiteBrowserReplaying(cookie);

            //ACT
            var response = await crossSite.PostAsync("/api/Echo", JsonContent.Create(new { }));

            //ASSERT
            response.StatusCode.ShouldBe(HttpStatusCode.Forbidden);
            _api.EchoCalls.ShouldBe(0);
        }

        //THE API'S OWN AUTH ENDPOINTS ARE NOT REACHABLE FROM THE BROWSER ////////////////////////////////////////////////

        [TestMethod]
        [DataRow("/api/auth/login")]
        [DataRow("/api/Auth/Login")]
        [DataRow("/api/auth/refresh")]
        [DataRow("/api/Auth/Refresh")]
        [DataRow("/api/auth/revoke")]
        [DataRow("/api/AUTH/REVOKE")]
        public async Task Should_Hide_The_Apis_Login_Refresh_And_Revoke_Endpoints_From_The_Browser(string path)
        {
            var browser = await SignedInBrowserAsync();
            var loginCallsBefore = _api.LoginCalls;

            var response = await browser.PostAsJsonAsync(path, new { username = "alan", password = "pw", accessToken = "a", refreshToken = "r" });

            response.StatusCode.ShouldBe(HttpStatusCode.NotFound);
            _api.LoginCalls.ShouldBe(loginCallsBefore);
            _api.RefreshCalls.ShouldBe(0);
            _api.RevokeCalls.ShouldBe(0);
        }

        //LOGOUT ///////////////////////////////////////////////////////////////////////////////////////////////////////

        [TestMethod]
        public async Task Should_Revoke_At_The_Api_And_Kill_The_Session_On_Logout()
        {
            //ARRANGE
            var browser = _factory.CreateBrowser();
            var cookie = SessionCookieValue(await LogInAsync(browser))!;

            //ACT
            var response = await browser.PostAsync("/bff/logout", null);

            //ASSERT
            response.StatusCode.ShouldBe(HttpStatusCode.NoContent);
            _api.RevokeCalls.ShouldBe(1);
            _api.LastRevokeAuthorization.ShouldBe($"Bearer {_api.LastIssuedAccessToken}");

            //Clearing the browser's cookie proves little: a COPY of the cookie must be useless too.
            (await BrowserReplaying(cookie).GetAsync("/bff/user")).StatusCode.ShouldBe(HttpStatusCode.Unauthorized);
        }

        [TestMethod]
        public async Task Should_Get_A_Fresh_Token_Before_Revoking_When_The_Sessions_Token_Is_About_To_Expire()
        {
            _api.LoginAccessTokenLifetime = TimeSpan.FromSeconds(10);
            var browser = await SignedInBrowserAsync();

            await browser.PostAsync("/bff/logout", null);

            //revoke needs a valid access token, so the BFF refreshed first and revoked with the NEW one
            _api.RefreshCalls.ShouldBe(1);
            _api.LastRevokeAuthorization.ShouldBe($"Bearer {_api.LastIssuedAccessToken}");
        }

        [TestMethod]
        public async Task Should_Still_End_The_Session_When_The_Api_Fails_To_Revoke()
        {
            _api.RevokeStatus = HttpStatusCode.InternalServerError;
            var browser = _factory.CreateBrowser();
            var cookie = SessionCookieValue(await LogInAsync(browser))!;

            var response = await browser.PostAsync("/bff/logout", null);

            response.StatusCode.ShouldBe(HttpStatusCode.NoContent);
            (await BrowserReplaying(cookie).GetAsync("/bff/user")).StatusCode.ShouldBe(HttpStatusCode.Unauthorized);
        }

        [TestMethod]
        public async Task Should_Accept_A_Logout_With_No_Session_Without_Calling_The_Api()
        {
            var browser = _factory.CreateBrowser();

            var response = await browser.PostAsync("/bff/logout", null);

            response.StatusCode.ShouldBe(HttpStatusCode.NoContent);
            _api.RevokeCalls.ShouldBe(0);
        }

        [TestMethod]
        public async Task Should_Refuse_A_Logout_That_Lacks_The_Csrf_Header_And_Leave_The_Session_Alive()
        {
            //ARRANGE
            var cookie = SessionCookieValue(await LogInAsync(_factory.CreateBrowser()))!;

            //ACT: a hostile page makes the victim's browser post a logout without the header
            var rejected = await CrossSiteBrowserReplaying(cookie).PostAsync("/bff/logout", null);

            //ASSERT: refused, and the session is untouched
            rejected.StatusCode.ShouldBe(HttpStatusCode.Forbidden);
            _api.RevokeCalls.ShouldBe(0);
            (await BrowserReplaying(cookie).GetAsync("/bff/user")).StatusCode.ShouldBe(HttpStatusCode.OK);
        }

        //TOKEN REFRESH ////////////////////////////////////////////////////////////////////////////////////////////////

        [TestMethod]
        public async Task Should_Refresh_An_Expiring_Token_Before_Forwarding_And_Send_The_New_One()
        {
            //ARRANGE: the login token is inside the 60s refresh window; the refreshed one is long-lived
            _api.LoginAccessTokenLifetime = TimeSpan.FromSeconds(10);
            var browser = await SignedInBrowserAsync();
            var loginToken = _api.LastIssuedAccessToken;

            //ACT
            var response = await browser.GetAsync("/api/Echo");

            //ASSERT
            response.StatusCode.ShouldBe(HttpStatusCode.OK);
            _api.RefreshCalls.ShouldBe(1);
            _api.LastRefreshRequestBody!.ShouldContain(loginToken!); //the BFF presented the pair it was holding
            _api.LastEcho!.Authorization.ShouldBe($"Bearer {_api.LastIssuedAccessToken}");
            _api.LastEcho.Authorization.ShouldNotContain(loginToken!);
        }

        [TestMethod]
        public async Task Should_Not_Refresh_A_Token_That_Is_Not_Near_Expiry()
        {
            var browser = await SignedInBrowserAsync();

            await browser.GetAsync("/api/Echo");
            await browser.GetAsync("/api/Echo");

            _api.RefreshCalls.ShouldBe(0);
        }

        [TestMethod]
        public async Task Should_Make_One_Refresh_Call_When_A_Page_Fires_Several_Requests_At_Once()
        {
            //ARRANGE
            _api.LoginAccessTokenLifetime = TimeSpan.FromSeconds(10);
            var browser = await SignedInBrowserAsync();

            //ACT
            var responses = await Task.WhenAll(Enumerable.Range(0, 8).Select(_ => browser.GetAsync("/api/Echo")));

            //ASSERT
            responses.ShouldAllBe(r => r.StatusCode == HttpStatusCode.OK);
            _api.RefreshCalls.ShouldBe(1);
        }

        [TestMethod]
        public async Task Should_Also_Refresh_When_Asked_Who_Am_I()
        {
            _api.LoginAccessTokenLifetime = TimeSpan.FromSeconds(10);
            var browser = await SignedInBrowserAsync();

            var response = await browser.GetAsync("/bff/user");

            response.StatusCode.ShouldBe(HttpStatusCode.OK);
            _api.RefreshCalls.ShouldBe(1);
        }

        [TestMethod]
        public async Task Should_End_The_Session_And_Clear_The_Cookie_When_The_Api_Rejects_The_Refresh_Token()
        {
            //ARRANGE
            _api.LoginAccessTokenLifetime = TimeSpan.FromSeconds(10);
            _api.RejectRefresh = true;
            var browser = _factory.CreateBrowser();
            var cookie = SessionCookieValue(await LogInAsync(browser))!;

            //ACT
            var response = await browser.GetAsync("/api/Echo");

            //ASSERT
            response.StatusCode.ShouldBe(HttpStatusCode.Unauthorized);
            _api.EchoCalls.ShouldBe(0);
            response.Headers.GetValues("Set-Cookie").ShouldContain(h => h.StartsWith("wt.session=;") && h.Contains("1970"));
            (await BrowserReplaying(cookie).GetAsync("/bff/user")).StatusCode.ShouldBe(HttpStatusCode.Unauthorized);
        }

        [TestMethod]
        public async Task Should_Report_A_Dead_Session_At_Once_When_Asked_Who_Am_I()
        {
            _api.LoginAccessTokenLifetime = TimeSpan.FromSeconds(10);
            _api.RejectRefresh = true;
            var browser = await SignedInBrowserAsync();

            var response = await browser.GetAsync("/bff/user");

            response.StatusCode.ShouldBe(HttpStatusCode.Unauthorized);
        }

        [TestMethod]
        public async Task Should_Answer_503_And_Keep_The_Session_When_The_Api_Is_Failing_During_A_Refresh()
        {
            //ARRANGE
            _api.LoginAccessTokenLifetime = TimeSpan.FromSeconds(10);
            _api.RefreshFailsWith = HttpStatusCode.ServiceUnavailable;
            var browser = await SignedInBrowserAsync();

            //ACT
            var whileDown = await browser.GetAsync("/api/Echo");
            _api.RefreshFailsWith = null; //the API recovers
            var afterRecovery = await browser.GetAsync("/api/Echo");

            //ASSERT: the outage said nothing about the user's session, so they are still signed in once it is back
            whileDown.StatusCode.ShouldBe(HttpStatusCode.ServiceUnavailable);
            afterRecovery.StatusCode.ShouldBe(HttpStatusCode.OK);
            _api.RefreshCalls.ShouldBe(2);
        }

        //ISOLATION ////////////////////////////////////////////////////////////////////////////////////////////////////

        [TestMethod]
        public async Task Should_Keep_Two_Users_Sessions_Separate()
        {
            var alan = await SignedInBrowserAsync("alan");
            var admin = await SignedInBrowserAsync("admin-bob");

            (await (await alan.GetAsync("/bff/user")).Content.ReadFromJsonAsync<BffUser>())!.UserName.ShouldBe("alan");
            (await (await admin.GetAsync("/bff/user")).Content.ReadFromJsonAsync<BffUser>())!.UserName.ShouldBe("admin-bob");

            await alan.PostAsync("/bff/logout", null);

            (await admin.GetAsync("/bff/user")).StatusCode.ShouldBe(HttpStatusCode.OK);
        }
    }
}
