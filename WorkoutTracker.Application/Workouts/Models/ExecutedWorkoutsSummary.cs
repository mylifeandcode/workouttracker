using System;
using System.Collections.Generic;

namespace WorkoutTracker.Application.Workouts.Models
{
    public class ExecutedWorkoutsSummary
    {
        public int TotalLoggedWorkouts { get; set; }
        public DateTime? FirstLoggedWorkoutDateTime { get; set; }
        public Dictionary<string, int> TargetAreasWithWorkoutCounts { get; set; }
    }
}
