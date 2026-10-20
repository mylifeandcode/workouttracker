using Microsoft.AspNetCore.Authentication;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Shouldly;
using WorkoutTracker.BFF.Models;
using WorkoutTracker.BFF.Session;
using WorkoutTracker.BFF.Tests.TestHelpers;

namespace WorkoutTracker.BFF.Tests.Session
{
    [TestClass]
    public class MemoryTicketStoreTests
    {
        private MemoryTicketStore _sut = null!;

        [TestInitialize]
        public void Initialize()
        {
            _sut = SessionTestHelper.CreateStore();
        }

        [TestMethod]
        public async Task Should_Store_A_Ticket_Under_A_Random_Key_And_Retrieve_It()
        {
            //ACT
            var key = await SessionTestHelper.StoreSessionAsync(_sut, "access-1", "refresh-1");
            var retrieved = await _sut.RetrieveAsync(key);

            //ASSERT
            key.Length.ShouldBeGreaterThanOrEqualTo(32);
            retrieved.ShouldNotBeNull();
            retrieved.Properties.GetTokenValue(SessionKeys.AccessToken).ShouldBe("access-1");
        }

        [TestMethod]
        public async Task Should_Give_Each_Session_A_Different_Key()
        {
            var first = await SessionTestHelper.StoreSessionAsync(_sut, "a1", "r1");
            var second = await SessionTestHelper.StoreSessionAsync(_sut, "a2", "r2");

            first.ShouldNotBe(second);
        }

        [TestMethod]
        public async Task Should_Record_Its_Own_Key_In_The_Ticket_So_Callers_Can_Find_Their_Session()
        {
            var key = await SessionTestHelper.StoreSessionAsync(_sut, "access-1", "refresh-1");

            var retrieved = await _sut.RetrieveAsync(key);

            retrieved!.Properties.Items[SessionKeys.SessionKey].ShouldBe(key);
        }

        [TestMethod]
        public async Task Should_Return_Null_For_An_Unknown_Key()
        {
            (await _sut.RetrieveAsync("no-such-session")).ShouldBeNull();
            _sut.GetTokens("no-such-session").ShouldBeNull();
        }

        [TestMethod]
        public async Task Should_Remove_A_Session()
        {
            var key = await SessionTestHelper.StoreSessionAsync(_sut, "access-1", "refresh-1");

            await _sut.RemoveAsync(key);

            (await _sut.RetrieveAsync(key)).ShouldBeNull();
            _sut.GetTokens(key).ShouldBeNull();
        }

        [TestMethod]
        public async Task Should_Return_The_Current_Token_Pair()
        {
            var key = await SessionTestHelper.StoreSessionAsync(_sut, "access-1", "refresh-1");

            _sut.GetTokens(key).ShouldBe(new AuthTokens("access-1", "refresh-1"));
        }

        [TestMethod]
        public async Task Should_Swap_In_Rotated_Tokens()
        {
            //ARRANGE
            var key = await SessionTestHelper.StoreSessionAsync(_sut, "access-1", "refresh-1");

            //ACT
            _sut.UpdateTokens(key, new AuthTokens("access-2", "refresh-2"));

            //ASSERT
            _sut.GetTokens(key).ShouldBe(new AuthTokens("access-2", "refresh-2"));
            var retrieved = await _sut.RetrieveAsync(key);
            retrieved!.Properties.GetTokenValue(SessionKeys.RefreshToken).ShouldBe("refresh-2");
        }

        [TestMethod]
        public async Task Should_Not_Mutate_The_Ticket_A_Concurrent_Reader_Already_Holds_When_Tokens_Are_Updated()
        {
            //ARRANGE: a request on another thread has already loaded the ticket and may still be reading its properties
            var key = await SessionTestHelper.StoreSessionAsync(_sut, "access-1", "refresh-1");
            var heldByReader = await _sut.RetrieveAsync(key);

            //ACT
            _sut.UpdateTokens(key, new AuthTokens("access-2", "refresh-2"));

            //ASSERT: the held instance is untouched; only the stored one carries the new tokens
            heldByReader!.Properties.GetTokenValue(SessionKeys.AccessToken).ShouldBe("access-1");
            _sut.GetTokens(key)!.AccessToken.ShouldBe("access-2");
        }

        [TestMethod]
        public void Should_Ignore_A_Token_Update_For_A_Session_That_No_Longer_Exists()
        {
            Should.NotThrow(() => _sut.UpdateTokens("gone", new AuthTokens("a", "r")));
            _sut.GetTokens("gone").ShouldBeNull();
        }

        /*
        THE STALE-TICKET REGRESSION.

        The cookie handler loads the ticket at the START of a request and, if it decides to slide the expiration forward,
        calls RenewAsync with that ticket at the END. A token refresh in between rotates the tokens, so the handler's copy
        is out of date. If RenewAsync took its tokens, the next refresh would present a refresh token the API had already
        rotated away; the API treats that as a replay and revokes the whole chain, signing the user out.
        */
        [TestMethod]
        public async Task Should_Keep_Newer_Tokens_When_Renewed_With_A_Ticket_Loaded_Before_A_Refresh()
        {
            //ARRANGE
            var key = await SessionTestHelper.StoreSessionAsync(_sut, "access-1", "refresh-1");
            var staleTicketLoadedAtStartOfRequest = (await _sut.RetrieveAsync(key))!;

            _sut.UpdateTokens(key, new AuthTokens("access-2", "refresh-2")); //a refresh happens during the request

            //AuthenticationProperties keeps ExpiresUtc as an RFC 1123 string, so it round-trips at whole-second precision only.
            var newExpiry = DateTimeOffset.FromUnixTimeSeconds(DateTimeOffset.UtcNow.AddDays(14).ToUnixTimeSeconds());
            staleTicketLoadedAtStartOfRequest.Properties.ExpiresUtc = newExpiry; //the handler slides the expiry

            //ACT
            await _sut.RenewAsync(key, staleTicketLoadedAtStartOfRequest);

            //ASSERT
            _sut.GetTokens(key).ShouldBe(new AuthTokens("access-2", "refresh-2"));
            var stored = await _sut.RetrieveAsync(key);
            stored!.Properties.ExpiresUtc.ShouldBe(newExpiry);
        }

        [TestMethod]
        public async Task Should_Keep_The_Session_Key_In_The_Ticket_After_Tokens_Are_Updated_And_Renewed()
        {
            var key = await SessionTestHelper.StoreSessionAsync(_sut, "access-1", "refresh-1");
            var ticket = (await _sut.RetrieveAsync(key))!;

            _sut.UpdateTokens(key, new AuthTokens("access-2", "refresh-2"));
            await _sut.RenewAsync(key, ticket);

            (await _sut.RetrieveAsync(key))!.Properties.Items[SessionKeys.SessionKey].ShouldBe(key);
        }

        [TestMethod]
        public async Task Should_Store_The_Ticket_When_Renewing_A_Key_It_Has_Not_Seen()
        {
            var ticket = SessionTestHelper.CreateTicket("access-1", "refresh-1");

            await _sut.RenewAsync("unseen-key", ticket);

            _sut.GetTokens("unseen-key").ShouldBe(new AuthTokens("access-1", "refresh-1"));
        }

        [TestMethod]
        public async Task Should_Drop_A_Session_Whose_Ticket_Has_Already_Expired()
        {
            var key = await SessionTestHelper.StoreSessionAsync(_sut, "access-1", "refresh-1", DateTimeOffset.UtcNow.AddMinutes(-1));

            (await _sut.RetrieveAsync(key)).ShouldBeNull();
        }
    }
}
