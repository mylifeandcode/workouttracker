using WorkoutTracker.Domain.Users;
using WorkoutTracker.Application.Shared.Interfaces;

namespace WorkoutTracker.Application.Users.Interfaces
{
    public interface IUserService : ISimpleService<User>
    {
        void ChangePassword(int userId, string currentPassword, string newPassword);
        string RequestPasswordReset(string emailAddress);
    }
}
