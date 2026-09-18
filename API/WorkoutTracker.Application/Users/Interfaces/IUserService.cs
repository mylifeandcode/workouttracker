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
        Task<string?> RequestPasswordResetAsync(string emailAddress, CancellationToken cancellationToken = default);
        Task ResetPasswordAsync(string resetCode, string newPassword, CancellationToken cancellationToken = default);
        Task<bool> ValidatePasswordResetCodeAsync(string resetCode, CancellationToken cancellationToken = default);
    }
}
