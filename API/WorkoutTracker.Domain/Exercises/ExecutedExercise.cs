﻿using System;
using System.Collections.Generic;
using System.Text;
using WorkoutTracker.Domain.BaseClasses;
using WorkoutTracker.Domain.Resistances;
using WorkoutTracker.Domain.Workouts;

namespace WorkoutTracker.Domain.Exercises
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
        public virtual byte Sequence { get; set; }

        /// <summary>
        /// The Exercise performed/to be performed.
        /// </summary>
        public virtual Exercise Exercise { get; set; }

        //The ID of the Exercise performed/to be performed.
        public virtual int ExerciseId { get; set; }

        public virtual ExecutedWorkout ExecutedWorkout { get; set; }
        public virtual int ExecutedWorkoutId { get; set; }

        /// <summary>
        /// The target number of repetitions.
        /// </summary>
        public virtual byte TargetRepCount { get; set; }
        
        /// <summary>
        /// The actual number of repetitions.
        /// </summary>
        public virtual byte ActualRepCount { get; set; }
        
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
        public string ResistanceMakeup { get; set; }

        /// <summary>
        /// The type of set the exercise was executed in.
        /// </summary>
        public SetType SetType { get; set; }

        /// <summary>
        /// The amount of time in seconds the exercise was performed for if 
        /// a time set.
        /// </summary>
        public ushort? Duration { get; set; }

        /// <summary>
        /// How well the form was for this exercise (the higher the number, the better).
        /// </summary>
        public byte FormRating { get; set; }
        
        /// <summary>
        /// How well the range of motion was for this exercise (the higher the number, the better).
        /// </summary>
        public byte RangeOfMotionRating { get; set; }

        /// <summary>
        /// The individual resistances which were used for this exercise.
        /// </summary>
        public virtual ICollection<Resistance> Resistances { get; set; } //TODO: Remove! Unused.

        /// <summary>
        /// For one-sided exercises, represents the side the exercise was performed on.
        /// </summary>
        public ExerciseSide? Side { get; set; }

        /// <summary>
        /// Creates a clone of the object. All values are the same except for the Id, which will be 0.
        /// </summary>
        /// <returns>An ExecutedExercise which is a clone of the one the method is called on.</returns>
        public ExecutedExercise Clone()
        {
            var clone = new ExecutedExercise();
            clone.ActualRepCount = ActualRepCount;
            clone.CreatedByUserId = CreatedByUserId;
            clone.CreatedDateTime = CreatedDateTime;
            clone.Duration = Duration;
            clone.Exercise = Exercise;
            clone.ExerciseId = ExerciseId;
            clone.ExecutedWorkout = ExecutedWorkout;
            clone.ExecutedWorkoutId = ExecutedWorkoutId;
            clone.FormRating = FormRating;
            clone.ModifiedDateTime = ModifiedDateTime;
            clone.ModifiedByUserId = ModifiedByUserId;
            clone.Notes = Notes;
            clone.RangeOfMotionRating = RangeOfMotionRating;
            clone.ResistanceAmount = ResistanceAmount;
            clone.ResistanceMakeup = ResistanceMakeup;
            clone.Resistances = Resistances;
            clone.Sequence = Sequence;
            clone.SetType = SetType;
            clone.Side = Side;
            clone.TargetRepCount = TargetRepCount;

            return clone;
        }
    }
}
