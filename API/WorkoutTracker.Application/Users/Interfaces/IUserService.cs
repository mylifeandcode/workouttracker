using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using WorkoutTracker.Application.Shared.Interfaces;
using WorkoutTracker.Application.Users.Models;
using WorkoutTracker.Domain.Users;

namespace WorkoutTracker.Application.Users.Interfaces
{
    public interface IUserService : ISimpleService<User>
    {
        Task<User?> GetByNameAsync(string name, CancellationToken cancellationToken = default);
        Task<IEnumerable<UserProfile>> GetAllProfilesAsync(CancellationToken cancellationToken = default);
        Task ChangePasswordAsync(int userId, string currentPassword, string newPassword, CancellationToken cancellationToken = default);

        /// <summary>
        /// True if the user exists and has not been deactivated. Used on every authenticated request, so it is a single
        /// cheap existence query.
        /// </summary>
        Task<bool> IsActiveAsync(int userId, CancellationToken cancellationToken = default);

        /// <summary>
        /// Administrator operation: changes only the name, email address and role. Everything else on the user
        /// (password hash, salt, audit fields, settings) is left exactly as it is.
        /// </summary>
        Task<UserAdministrationOutcome> UpdateProfileAsync(Guid publicId, string userName, string emailAddress, UserRole role, int actingUserId, CancellationToken cancellationToken = default);

        /// <summary>
        /// Changes the given user's own settings, and only the settings.
        /// </summary>
        Task<UserAdministrationOutcome> UpdateSettingsAsync(int userId, UserSettingsUpdate settings, CancellationToken cancellationToken = default);

        /// <summary>
        /// Administrator operation, the "delete" of a user: blocks sign-in and revokes their sessions, but keeps their data.
        /// </summary>
        Task<UserAdministrationOutcome> DeactivateAsync(Guid publicId, int actingUserId, CancellationToken cancellationToken = default);

        Task<UserAdministrationOutcome> ReactivateAsync(Guid publicId, int actingUserId, CancellationToken cancellationToken = default);
    }
}
