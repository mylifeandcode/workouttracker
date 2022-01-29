using System;
using System.Collections.Generic;
using System.Text;
using WorkoutTracker.Domain.BaseClasses;
using WorkoutTracker.Domain.Exercises;

namespace WorkoutTracker.Domain.Sets
{
    public abstract class Set : Entity
    {
        /// <summary>
        /// The sequence in which this set of exercises appears in the workout
        /// </summary>
        public short Sequence { get; set; }

        /// <summary>
        /// The exercise to be performed in this set
        /// </summary>
        public virtual Exercise Exercise { get; set; }
    }
}
