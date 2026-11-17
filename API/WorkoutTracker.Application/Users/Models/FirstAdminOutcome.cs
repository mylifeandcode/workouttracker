namespace WorkoutTracker.Application.Users.Models
{
    public enum FirstAdminStatus
    {
        Created,
        AlreadySetUp,
        InvalidCode,
        LockedOut,
        InvalidInput
    }

    /// <summary>
    /// The result of trying to create the first administrator. <see cref="Message"/> is only set for
    /// <see cref="FirstAdminStatus.InvalidInput"/>, and is safe to show to the caller.
    /// </summary>
    public record FirstAdminOutcome(FirstAdminStatus Status, string? Message = null);
}
