using System;
using System.Collections.Generic;
using System.Text;
using WorkoutApplication.Domain.BaseClasses;

namespace WorkoutApplication.Domain.Exercises
{
    public class ExerciseInWorkout : Entity
    {
        public virtual Exercise Exercise { get; set; }
        public virtual int ExerciseId { get; set; }
        public short NumberOfSets { get; set; }
        public SetType SetType { get; set; }
    }
}
