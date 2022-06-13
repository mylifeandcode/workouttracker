using System;
using System.Collections.Generic;

namespace WorkoutTracker.UI.Models
{
    public class ExecutedWorkoutsSummary
    {
        public int TotalLoggedWorkouts { get; set; }
        public DateTime? FirstLoggedWorkoutDateTime { get; set; }
        public Dictionary<string, int> TargetAreasWithWorkoutCounts { get; set; }
    }
}
