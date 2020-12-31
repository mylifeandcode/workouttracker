using System;
using System.Collections.Generic;
using System.Text;
using WorkoutApplication.Domain.BaseClasses;
using WorkoutApplication.Domain.Users;

namespace WorkoutTracker.Application.Users
{
    public class UserDTO : NamedEntity
    {
        public string ProfilePic { get; set; }

        public UserDTO() { }

        public UserDTO(User user)
        {
            this.CreatedByUserId = user.CreatedByUserId;
            this.CreatedDateTime = user.CreatedDateTime;
            this.Id = user.Id;
            this.ModifiedByUserId = user.ModifiedByUserId;
            this.ModifiedDateTime = user.ModifiedDateTime;
            this.Name = user.Name;
            this.ProfilePic = user.ProfilePic;
        }
    }
}
