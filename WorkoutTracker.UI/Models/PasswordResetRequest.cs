namespace WorkoutTracker.UI.Models
{
    public class PasswordResetRequest
    {
        public string ResetCode { get; set; }
        public string NewPassword { get; set; }
    }
}
