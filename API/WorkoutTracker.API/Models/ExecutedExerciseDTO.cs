using Microsoft.EntityFrameworkCore.Metadata.Internal;
using System;
using WorkoutTracker.Domain.BaseClasses;
using WorkoutTracker.Domain.Exercises;

namespace WorkoutTracker.API.Models
{
    public class ExecutedExerciseDTO : NamedEntity //Note this inherits from NamedEntity, not NamedEntityDTO
    {
        /// <summary>
        /// The ID of the Exercise that was executed
        /// </summary>
        public int ExerciseId { get; set; }

        public ResistanceType ResistanceType { get; set; }

        /// <summary>
        /// The order in which this Exercise appears in the Workout.
        /// </summary>
        public byte Sequence { get; set; }

        /// <summary>
        /// The target number of repetitions.
        /// </summary>
        public byte TargetRepCount { get; set; }

        /// <summary>
        /// The actual number of repetitions.
        /// </summary>
        public byte ActualRepCount { get; set; }

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
        public bool? BandsEndToEnd { get; set; }
        public bool InvolvesReps { get; set; }


        public ExecutedExerciseDTO(
            int id, string name, int exerciseId, ResistanceType resistanceType, byte sequence,
            byte targetRepCount, byte actualRepCount, string notes,
            decimal resistanceAmount, string resistanceMakeup, SetType setType,
            ushort? duration, byte formRating, byte rangeOfMotionRating,
            bool? bandsEndToEnd, bool involvesReps, 
            int createdByUserId, DateTime createdDateTime, int? modifiedByUserId, DateTime? modifiedDateTime)
        {
            Id = id;
            Name = name;
            ExerciseId = exerciseId;
            ResistanceType = resistanceType;
            Sequence = sequence;
            TargetRepCount = targetRepCount;
            ActualRepCount = actualRepCount;
            Notes = notes;
            ResistanceAmount = resistanceAmount;
            ResistanceMakeup = resistanceMakeup;
            SetType = setType;
            Duration = duration;
            FormRating = formRating;
            RangeOfMotionRating = rangeOfMotionRating;
            BandsEndToEnd = bandsEndToEnd;
            InvolvesReps = involvesReps;
            CreatedByUserId = createdByUserId;
            CreatedDateTime = createdDateTime;
            ModifiedByUserId = modifiedByUserId;
            ModifiedDateTime = modifiedDateTime;
        }
    }
}
