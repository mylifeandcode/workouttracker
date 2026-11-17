namespace WorkoutTracker.Application.Security
{
    /// <summary>
    /// The one rule for what counts as an acceptable new password, used everywhere a password is set: first-administrator
    /// setup, creating a user, changing a password, and resetting one. It applies when a password is set, so passwords
    /// created under the old, looser rule keep working until their owner next changes them.
    /// </summary>
    public static class PasswordPolicy
    {
        public const int MinLength = 12;

        //Bounds the work of hashing a password, so a huge "password" can't be used to tie the server up.
        public const int MaxLength = 128;

        /// <returns>A message that is safe to show the user, or null if the password is acceptable.</returns>
        public static string? Validate(string? password)
        {
            if (string.IsNullOrEmpty(password) || password.Length < MinLength)
                return $"The password must be at least {MinLength} characters.";

            if (password.Length > MaxLength)
                return $"The password must be at most {MaxLength} characters.";

            return null;
        }
    }
}
