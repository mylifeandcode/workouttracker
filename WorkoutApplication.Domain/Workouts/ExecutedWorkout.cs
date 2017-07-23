using System;
using System.Collections.Generic;
using System.Text;
using WorkoutApplication.Domain.BaseClasses;

namespace WorkoutApplication.Domain.Workouts
{
    public class ExecutedWorkout : Entity
    {
        public virtual Workout Workout { get; set; }
        public DateTime StartDateTime { get; set; }
        public DateTime EndDateTime { get; set; }
        public string Journal { get; set; }
        public int Rating { get; set; }
    }
}
