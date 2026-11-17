using System;
using System.Threading;
using System.Threading.Tasks;
using WorkoutTracker.Application.Users.Models;

namespace WorkoutTracker.Application.Users.Interfaces
{
    public interface IPasswordResetService
    {
        /// <summary>
        /// The public "forgot my password" request. Emails a one-time reset link if the address belongs to an active user
        /// and email is configured, and otherwise does nothing. It never reports which of those happened (that would tell
        /// a stranger whether an address has an account), and it never throws for anything but cancellation.
        /// </summary>
        Task RequestResetEmailAsync(string? emailAddress, CancellationToken cancellationToken = default);

        /// <summary>
        /// Administrator operation, for when email isn't configured: creates a one-time reset token for a user, to hand
        /// to them in person.
        /// </summary>
        Task<PasswordResetIssueOutcome> CreateResetForAdminAsync(Guid publicId, int actingUserId, CancellationToken cancellationToken = default);

        /// <summary>
        /// True if the token is known, unexpired and unused, and its user is active.
        /// </summary>
        Task<bool> ValidateTokenAsync(string? token, CancellationToken cancellationToken = default);

        /// <summary>
        /// Sets a new password for the token's user and spends the token. Also ends all of that user's sessions.
        /// </summary>
        Task<PasswordResetOutcome> ResetPasswordAsync(string? token, string? newPassword, CancellationToken cancellationToken = default);
    }
}
