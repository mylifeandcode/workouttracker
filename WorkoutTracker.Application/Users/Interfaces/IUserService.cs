using WorkoutTracker.Domain.Users;
using WorkoutTracker.Application.Shared.Interfaces;

namespace WorkoutTracker.Application.Users.Interfaces
{
    public interface IUserService : ISimpleService<User>
    {
    }
}
