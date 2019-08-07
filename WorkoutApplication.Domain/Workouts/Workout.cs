using System;
using System.Collections.Generic;
using System.Text;
using WorkoutApplication.Domain.BaseClasses;
using WorkoutApplication.Domain.Exercises;
using WorkoutApplication.Domain.Sets;

namespace WorkoutApplication.Domain.Workouts
{
    public class Workout : NamedEntity
    {
        public int UserId { get; set; }
        public virtual IEnumerable<ExerciseInWorkout> Exercises { get; set; }
    }
}
