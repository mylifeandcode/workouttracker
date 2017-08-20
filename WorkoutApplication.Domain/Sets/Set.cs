using System;
using System.Collections.Generic;
using System.Text;
using WorkoutApplication.Domain.BaseClasses;
using WorkoutApplication.Domain.Exercises;

namespace WorkoutApplication.Domain.Sets
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
