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
        /// The amount of resistance used when this exercise was executed.
        /// </summary>
        public decimal ResistanceAmount { get; set; }
        
        /// <summary>
        /// A string representing the different resistances which add up to the 
        /// total resistance amount. Does not apply to all resistance types 
        /// (for example, body weight or machine weight).
        /// </summary>
        /// <example>
        /// For an exercise using resistance bands by Bodylastics, a ResistanceMakeup 
        /// value of O,O,P,Blk indicates two orange bands, one purple band, and a 
        /// black band.
        /// </example>
        public decimal ResistanceMakeup { get; set; }

        /// <summary>
        /// The individual resistances which were used for this exercise.
        /// </summary>
        public virtual ICollection<Resistance> Resistances { get; set; }
    }
}
