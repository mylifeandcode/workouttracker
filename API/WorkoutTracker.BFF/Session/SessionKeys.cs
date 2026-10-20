namespace WorkoutTracker.BFF.Session
{
    /// <summary>Names used inside the server-side session ticket and HttpContext.Items.</summary>
    public static class SessionKeys
    {
        public const string AccessToken = "access_token";
        public const string RefreshToken = "refresh_token";

        // Stored in the ticket's properties so code holding only the authenticated principal can find its own session.
        public const string SessionKey = "wt.session_key";

        // Set per request by TokenRefreshMiddleware; read by the proxy transform.
        public const string FreshAccessTokenItem = "wt.fresh_access_token";
    }
}
