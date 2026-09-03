using System.Collections.Generic;
using WorkoutTracker.API.Models;
using WorkoutTracker.Domain.Users;

namespace WorkoutTracker.API.Mappers
{
    public interface IUserDTOMapper
    {
        UserSummaryDTO MapFromUserToSummary(User user);
        IEnumerable<UserSummaryDTO> MapFromUsersToSummaries(IEnumerable<User> users);
        UserDTO MapFromUser(User user);
    }
}
