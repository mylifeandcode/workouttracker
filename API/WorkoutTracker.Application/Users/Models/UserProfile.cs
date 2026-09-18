using System;

namespace WorkoutTracker.Application.Users.Models
{
    public class UserProfile
    {
        public Guid PublicId { get; set; }
        public string Name { get; set; }
    }
}
