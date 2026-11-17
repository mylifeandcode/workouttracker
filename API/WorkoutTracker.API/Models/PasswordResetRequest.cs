namespace WorkoutTracker.API.Models
{
    public class PasswordResetRequest
    {
        /// <summary>
        /// The one-time token from the reset link.
        /// </summary>
        public string Token { get; set; } = string.Empty;
        public string NewPassword { get; set; } = string.Empty;
    }
}
