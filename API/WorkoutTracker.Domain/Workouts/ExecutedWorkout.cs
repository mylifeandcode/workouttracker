﻿using System;
using System.Collections.Generic;
using System.Text;
using WorkoutTracker.Domain.BaseClasses;
using WorkoutTracker.Domain.Exercises;
using WorkoutTracker.Domain.Interfaces;

namespace WorkoutTracker.Domain.Workouts
{
    /// <summary>
    /// A class representing on occurrence of a Workout, i.e. a Workout 
    /// which a user performed.
    /// </summary>
    public class ExecutedWorkout : Entity, IPublicEntity
    {
        /// <summary>
        /// The Workout which was executed.
        /// </summary>
        public virtual Workout Workout { get; set; }

        /// <summary>
        /// The ID of the Workout which was executed.
        /// </summary>
        public virtual int WorkoutId { get; set; }

        /// <summary>
        /// The publicly-accessible ID for the executed Workout
        /// </summary>
        public Guid PublicId { get; set; } = Guid.NewGuid(); //Because even with EF's ValueGeneratedOnAdd(), this wasn't getting set in code, but was working for direct SQL inserts

        /// <summary>
        /// The date/time the user began the Workout.
        /// </summary>
        public DateTime? StartDateTime { get; set; }
        
        /// <summary>
        /// THe date/time the user completed or stopped the Workout.
        /// </summary>
        public DateTime? EndDateTime { get; set; }
        
        /// <summary>
        /// Any notes related to this occurrence of the Workout. For example, 
        /// the user can include thoughts about their energy level, how they 
        /// were failing, or what music they were listening to during the Workout.
        /// </summary>
        public string Journal { get; set; }
        
        /// <summary>
        /// A number indicating how well the Workout went (the higher the 
        /// number, the better the Workout).
        /// </summary>
        public int Rating { get; set; }
        
        /// <summary>
        /// The Exercises to have been performed during the Workout.
        /// </summary>
        public virtual ICollection<ExecutedExercise> Exercises { get; set; }
    }
}
