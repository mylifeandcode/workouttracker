using Microsoft.AspNetCore.Identity;
using System;
using System.ComponentModel.DataAnnotations.Schema;
using WorkoutTracker.Domain.Interfaces;

namespace WorkoutTracker.Domain.Users
{
    public class User : IdentityUser<int>, IPublicEntity, IEntity
    {
        public int CreatedByUserId { get; set; }
        public DateTime CreatedDateTime { get; set; }
        public int? ModifiedByUserId { get; set; }
        public DateTime? ModifiedDateTime { get; set; }

        public Guid PublicId { get; set; }

        public string UserName { get; set; }

        public string EmailAddress { get; set; }

        [Newtonsoft.Json.JsonIgnore]
        public string HashedPassword { get; set; }

        public string ProfilePic { get; set; }

        public virtual UserSettings Settings { get; set; } = new UserSettings(); //Single object containing all of the user-specific settings
        
        public UserRole Role { get; set; }

        [Newtonsoft.Json.JsonIgnore]
        public string Salt { get; set; }

        [Newtonsoft.Json.JsonIgnore]
        public string PasswordResetCode { get; set; }

        [NotMapped]
        public bool PasswordProtected
        {
            get { return !string.IsNullOrWhiteSpace(HashedPassword); }
        } 
    }
}
