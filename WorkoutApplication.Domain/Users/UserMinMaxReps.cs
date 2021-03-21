using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WorkoutApplication.Domain.BaseClasses;

namespace WorkoutApplication.Domain.Users
{
    public class UserMinMaxReps : Entity
    {
        public int UserSettingsId { get; set; }
        public UserGoal Goal { get; set; }
        public SetType SetType { get; set; }
        public ushort? Duration { get; set; }
        public byte MinReps { get; set; }
        public byte MaxReps { get; set; }
    }
}
