namespace WorkoutTracker.API.Models
{
    /// <summary>
    /// What an administrator can change about another user. Nothing else about a user is editable through the API:
    /// not the password hash, the audit fields, or the settings.
    /// </summary>
    public class UserUpdateDTO
    {
        public string UserName { get; set; } = string.Empty;
        public string EmailAddress { get; set; } = string.Empty;
        public UserRole Role { get; set; }
    }
}
