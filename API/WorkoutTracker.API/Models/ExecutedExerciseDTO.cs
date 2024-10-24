using System;
using WorkoutTracker.Domain.Exercises;

namespace WorkoutTracker.API.Models
{
    public record ExecutedExerciseDTO(
        int Id, //Not a GUID public ID. This is a child entity and not an aggregate.
        DateTime CreatedDateTime, 
        DateTime? ModifiedDateTime, 
        string Name, 
        Guid ExerciseId,
        ResistanceType ResistanceType,
        byte Sequence,
        byte TargetRepCount,
        byte ActualRepCount,
        string Notes,
        decimal ResistanceAmount,
        string ResistanceMakeup,
        SetType SetType,
        ushort? Duration,
        byte FormRating,
        byte RangeOfMotionRating,
        bool? BandsEndToEnd,
        bool InvolvesReps,
        ExerciseSide? Side,
        bool UsesBilateralResistance);

}
