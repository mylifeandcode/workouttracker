using System;
using System.Collections.Generic;
using System.Text;
using WorkoutTracker.Domain.BaseClasses;
using WorkoutTracker.Domain.Exercises;
using WorkoutTracker.Domain.Sets;

namespace WorkoutTracker.Domain.Workouts
{
    public class Workout : NamedEntity
    {
        public virtual ICollection<ExerciseInWorkout> Exercises { get; set; }
        public bool Active { get; set; }
    }
}
