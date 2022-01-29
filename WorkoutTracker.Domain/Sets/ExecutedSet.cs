using System;
using System.Collections.Generic;
using System.Text;
using WorkoutTracker.Domain.BaseClasses;
using WorkoutTracker.Domain.Exercises;

namespace WorkoutTracker.Domain.Sets
{
    public abstract class ExecutedSet : Entity
    {
        public virtual Set Set { get; set; }
        public virtual ExecutedExercise ExecutedExercise { get; set; }
    }
}
