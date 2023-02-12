using System;

namespace WorkoutTracker.API.Models
{
    public class UserOverview
    {
        public string Username { get; set; }
        public DateTime? LastWorkoutDateTime { get; set; }
        public int PlannedWorkoutCount { get; set; }
    }
}
