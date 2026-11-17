namespace WorkoutTracker.Application.Users.Models
{
    public enum SetupCodeResult
    {
        Valid,
        Invalid,

        /// <summary>
        /// Too many wrong guesses in a row. Every attempt is refused (the right code too) until the lockout ends.
        /// </summary>
        LockedOut
    }
}
