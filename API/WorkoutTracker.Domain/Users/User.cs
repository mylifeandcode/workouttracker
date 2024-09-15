using System;
using System.ComponentModel.DataAnnotations.Schema;
using WorkoutTracker.Domain.BaseClasses;
using WorkoutTracker.Domain.Interfaces;

namespace WorkoutTracker.Domain.Users
{
    public class User : NamedEntity, IPublicEntity
    {
        public Guid PublicId { get; set; }

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
