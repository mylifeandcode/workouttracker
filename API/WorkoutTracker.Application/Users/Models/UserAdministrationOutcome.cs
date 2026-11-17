namespace WorkoutTracker.Application.Users.Models
{
    public enum UserAdministrationResult
    {
        Done,
        NotFound,

        /// <summary>
        /// The acting user is not (or is no longer) an active administrator.
        /// </summary>
        NotPermitted,
        InvalidInput,
        CannotDeactivateSelf,
        CannotDeactivateSystem,
        CannotRemoveLastAdministrator
    }

    /// <summary>
    /// The result of an administrative change to a user. <see cref="Message"/> is a short text that is safe to show
    /// to the caller, set for the refusals that need explaining.
    /// </summary>
    public record UserAdministrationOutcome(UserAdministrationResult Result, string? Message = null);
}
