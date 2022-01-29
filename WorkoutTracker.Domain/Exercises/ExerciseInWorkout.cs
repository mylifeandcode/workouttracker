using System;
using System.Collections.Generic;
using System.Text;
using WorkoutTracker.Domain.BaseClasses;

namespace WorkoutTracker.Domain.Exercises
{
    public class ExerciseInWorkout : Entity
    {
        public virtual Exercise Exercise { get; set; }
        public virtual int ExerciseId { get; set; }
        public byte NumberOfSets { get; set; }
        public SetType SetType { get; set; }
        public byte Sequence { get; set; }
    }
}
