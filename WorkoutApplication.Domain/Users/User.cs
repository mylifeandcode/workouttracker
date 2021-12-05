using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;
using WorkoutApplication.Domain.BaseClasses;

namespace WorkoutApplication.Domain.Users
{
    public class User : NamedEntity
    {
        [Newtonsoft.Json.JsonIgnore]
        public string HashedPassword { get; set; }
        public string ProfilePic { get; set; }
        public virtual UserSettings Settings { get; set; } //Single object containing all of the user-specific settings
        public UserRole Role { get; set; }

        [NotMapped]
        public bool PasswordProtected
        {
            get { return !string.IsNullOrWhiteSpace(HashedPassword); }
        } 
    }
}
