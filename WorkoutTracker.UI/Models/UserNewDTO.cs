namespace WorkoutTracker.UI.Models
{
    public class UserNewDTO
    {
        public string UserName { get; set; }
        public string EmailAddress { get; set; }
        public string Password { get; set; }
        public UserRole Role { get; set; }
    }
}
