using System;
using System.Collections.Generic;

namespace WorkoutTracker.API.Models
{
    //WE NEED BOTH IDS HERE: the raw Id and CreatedByUserId are round-tripped back through
    //Post/Put by the edit screen (which still take/return the raw Workout entity), so they
    //can't be dropped the way a read-only DTO normally would.
    public record WorkoutDetailDTO(
        int Id,
        Guid PublicId,
        int CreatedByUserId,
        DateTime CreatedDateTime,
        DateTime? ModifiedDateTime,
        string Name,
        bool Active,
        IEnumerable<ExerciseInWorkoutDetailDTO> Exercises);
}
