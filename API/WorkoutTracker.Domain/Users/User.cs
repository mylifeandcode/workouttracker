using System;
using System.ComponentModel.DataAnnotations.Schema;
using WorkoutTracker.Domain.BaseClasses;
using WorkoutTracker.Domain.Interfaces;

namespace WorkoutTracker.Domain.Users
{
    public class User : NamedEntity, IPublicEntity
    {
        public Guid PublicId { get; set; } = Guid.NewGuid();

        public string EmailAddress { get; set; }

        [Newtonsoft.Json.JsonIgnore]
        public string? HashedPassword { get; set; }

        public string? ProfilePic { get; set; }

        public virtual UserSettings Settings { get; set; } = new UserSettings(); //Single object containing all of the user-specific settings
        
        public UserRole Role { get; set; }

        /// <summary>
        /// False once an administrator has deactivated the user (the "delete" operation): they can't sign in or use an
        /// existing session, but their data is kept and they can be reactivated.
        /// </summary>
        public bool IsActive { get; set; } = true;

        [Newtonsoft.Json.JsonIgnore]
        public string? Salt { get; set; }

        /// <summary>
        /// SHA-256 hash (hex) of the live password reset token, if there is one. The token itself is never stored.
        /// </summary>
        [Newtonsoft.Json.JsonIgnore]
        public string? PasswordResetTokenHash { get; set; }

        [Newtonsoft.Json.JsonIgnore]
        public DateTime? PasswordResetTokenExpiresAt { get; set; }

        [NotMapped]
        public bool PasswordProtected
        {
            get { return !string.IsNullOrWhiteSpace(HashedPassword); }
        } 
    }
}
