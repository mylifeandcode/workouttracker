using System;
using System.Threading.Tasks;
using WorkoutTracker.Application.Shared.Interfaces;
using WorkoutTracker.Domain.Users;

namespace WorkoutTracker.Application.Users.Interfaces
{
    public interface IUserService : ISimpleService<User>
    {
        Task ChangePasswordAsync(int userId, string currentPassword, string newPassword);
        Task<string?> RequestPasswordResetAsync(string emailAddress);
        Task ResetPasswordAsync(string resetCode, string newPassword);
        Task<bool> ValidatePasswordResetCodeAsync(string resetCode);
    }
}
