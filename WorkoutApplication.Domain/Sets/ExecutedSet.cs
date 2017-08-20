using System;
using System.Collections.Generic;
using System.Text;
using WorkoutApplication.Domain.BaseClasses;
using WorkoutApplication.Domain.Exercises;

namespace WorkoutApplication.Domain.Sets
{
    public abstract class ExecutedSet : Entity
    {
        public virtual Set Set { get; set; }
        public virtual ExecutedExercise ExecutedExercise { get; set; }
    }
}
