using System.Collections.Generic;
using WorkoutTracker.Domain.Exercises;

namespace WorkoutTracker.API.Models
{
    public record ExerciseInWorkoutDetailDTO(
        int Id, //Not a GUID public ID. This is a child entity and not an aggregate.
        int ExerciseId,
        string ExerciseName,
        byte NumberOfSets,
        SetType SetType,
        ResistanceType ResistanceType,
        IEnumerable<string> TargetAreas);
}
