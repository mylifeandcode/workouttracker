using System;
using System.Collections.Generic;
using System.Text;
using WorkoutTracker.Domain.BaseClasses;
using WorkoutTracker.Domain.Users;

namespace WorkoutTracker.Application.Users.Models
{
    public class UserDTO : NamedEntity
    {
        public string ProfilePic { get; set; }

        public UserDTO() { }

        public UserDTO(User user)
        {
            CreatedByUserId = user.CreatedByUserId;
            CreatedDateTime = user.CreatedDateTime;
            Id = user.Id;
            ModifiedByUserId = user.ModifiedByUserId;
            ModifiedDateTime = user.ModifiedDateTime;
            Name = user.Name;
            ProfilePic = user.ProfilePic;
        }
    }
}
