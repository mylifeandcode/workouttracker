using System;
using System.Collections.Generic;
using System.Text;
using WorkoutApplication.Domain.BaseClasses;

namespace WorkoutApplication.Domain
{
    public abstract class Set : Entity
    {
        public int TargetExerciseCount { get; set; }
    }
}
