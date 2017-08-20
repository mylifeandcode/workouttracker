using System;
using System.Collections.Generic;
using System.Text;
using WorkoutApplication.Domain.BaseClasses;

namespace WorkoutApplication.Domain
{
    public class User : NamedEntity
    {
        public string HashedPassword { get; set; }
        public string ProfilePic { get; set; }
    }
}
