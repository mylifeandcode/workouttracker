using System;
using System.Collections.Generic;
using System.Text;
using WorkoutApplication.Domain.BaseClasses;
using WorkoutApplication.Domain.Exercises;

namespace WorkoutApplication.Domain.Sets
{
    public abstract class Set : Entity
    {
        public int TargetExerciseCount { get; set; }
        public virtual IEnumerable<Exercise> Exercises { get; set; }
    }
}
