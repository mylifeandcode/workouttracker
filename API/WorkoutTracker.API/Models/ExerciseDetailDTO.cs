using System;
using System.Collections.Generic;
using WorkoutTracker.Domain.Exercises;

namespace WorkoutTracker.API.Models
{
    //WE NEED BOTH IDS HERE: the raw Id and CreatedByUserId are round-tripped back through
    //Post/Put by the edit screen (which still take/return the raw Exercise entity), so they
    //can't be dropped the way a read-only DTO normally would.
    public record ExerciseDetailDTO(
        int Id,
        Guid PublicId,
        int CreatedByUserId,
        DateTime CreatedDateTime,
        string Name,
        string Description,
        string Setup,
        string Movement,
        string PointsToRemember,
        ResistanceType ResistanceType,
        bool OneSided,
        bool? BandsEndToEnd,
        bool InvolvesReps,
        bool UsesBilateralResistance,
        List<int> TargetAreaIds);
}
