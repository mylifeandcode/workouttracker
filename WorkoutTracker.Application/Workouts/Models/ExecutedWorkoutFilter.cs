using System;
using System.Collections.Generic;
using System.Text;

namespace WorkoutTracker.Application.Workouts.Models
{
    public class ExecutedWorkoutFilter
    {
        public int UserId { get; set; }
        public DateTime? StartDateTime { get; set; }
        public DateTime? EndDateTime { get; set; }
    }
}
