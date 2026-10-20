namespace WorkoutTracker.BFF.Models
{
    // What the SPA posts to /bff/login. Mirrors the API's UserCredentialsDTO.
    public record LoginRequest(string Username, string Password);

    // Mirrors the API's AuthTokenResultDTO. These never leave the BFF.
    public record AuthTokens(string AccessToken, string RefreshToken);

    // The only identity information the SPA ever sees. Replaces client-side JWT decoding.
    public record BffUser(string UserName, bool IsAdmin, int UserId, Guid UserPublicId);
}
