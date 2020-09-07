using System;
using System.Collections.Generic;
using System.Text;
using WorkoutApplication.Domain.BaseClasses;
using WorkoutApplication.Domain.Resistances;

namespace WorkoutApplication.Domain.Exercises
{
    /// <summary>
    /// A class representing an Exercise executed as part of a Workout. 
    /// It is intended to be executed, but could also have been skipped.
    /// </summary>
    public class ExecutedExercise : Entity
    {
        /// <summary>
        /// The order in which this Exercise appears in the Workout.
        /// </summary>
        public virtual int Sequence { get; set; }

        /// <summary>
        /// The Exercise performed/to be performed.
        /// </summary>
        public virtual Exercise Exercise { get; set; }
        
        /// <summary>
        /// The target number of repetitions.
        /// </summary>
        public virtual int TargetRepCount { get; set; }
        
        /// <summary>
        /// The actual number of repetitions.
        /// </summary>
        public virtual int ActualRepCount { get; set; }
        
        /// <summary>
        /// Any notes pertaining to the Exercise performed 
        /// (or a reason why it was skipped!).
        /// </summary>
        public string Notes { get; set; }

        /// <summary>
        /// The Resistances used/intended during the Exercise.
        /// </summary>
        public virtual IEnumerable<Resistance> Resistances { get; set; }
    }
}
