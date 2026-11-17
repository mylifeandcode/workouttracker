using System;

namespace WorkoutTracker.Application.Users.Models
{
    public enum PasswordResetResult
    {
        Done,

        /// <summary>
        /// The reset token is unknown, expired, already used, or belongs to a user who is no longer active. These are
        /// deliberately not told apart.
        /// </summary>
        InvalidToken,
        InvalidPassword,

        /// <summary>
        /// The acting user is not (or is no longer) an active administrator.
        /// </summary>
        NotPermitted,
        NotFound
    }

    /// <param name="Message">Set for <see cref="PasswordResetResult.InvalidPassword"/>, and safe to show to the caller.</param>
    public record PasswordResetOutcome(PasswordResetResult Result, string? Message = null);

    /// <summary>
    /// The result of an administrator creating a reset token for someone. <see cref="Token"/> is the raw token, which
    /// exists only in this result (and, for the emailed flow, in the email): only its hash is stored.
    /// </summary>
    public record PasswordResetIssueOutcome(PasswordResetResult Result, string? Token = null, DateTime? ExpiresAt = null);
}
