using System;
using System.Collections.Generic;
using System.Linq;
using WorkoutTracker.API.Models;
using WorkoutTracker.Application.Users.Models;
using WorkoutTracker.Domain.Users;

namespace WorkoutTracker.API.Mappers
{
    public class UserDTOMapper : IUserDTOMapper
    {
        public UserSummaryDTO MapFromUserToSummary(User user)
        {
            if (user == null) throw new ArgumentNullException(nameof(user));

            return new UserSummaryDTO(user.Id, user.PublicId, user.Name);
        }

        public IEnumerable<UserSummaryDTO> MapFromUsersToSummaries(IEnumerable<User> users)
        {
            if (users == null) throw new ArgumentNullException(nameof(users));

            return users.Select(MapFromUserToSummary);
        }

        public UserDTO MapFromUser(User user)
        {
            if (user == null) throw new ArgumentNullException(nameof(user));

            return new UserDTO(user.Id, user.PublicId, user.Name, user.EmailAddress, user.Role, user.Settings);
        }

        public IEnumerable<UserProfileDTO> MapFromProfiles(IEnumerable<UserProfile> profiles)
        {
            if (profiles == null) throw new ArgumentNullException(nameof(profiles));

            return profiles.Select(p => new UserProfileDTO(p.PublicId, p.Name));
        }
    }
}
