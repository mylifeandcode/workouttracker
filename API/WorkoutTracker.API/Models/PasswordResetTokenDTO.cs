using System;

namespace WorkoutTracker.API.Models
{
    /// <summary>
    /// What an administrator gets when they create a password reset for someone: the one-time token to give to that
    /// person, and when it stops working. This is the only place the API ever returns a reset token.
    /// </summary>
    public class PasswordResetTokenDTO
    {
        public string Token { get; set; } = string.Empty;
        public DateTime ExpiresAt { get; set; }
    }
}
