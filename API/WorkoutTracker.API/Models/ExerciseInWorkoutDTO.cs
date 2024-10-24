using System;
using WorkoutTracker.Domain.Exercises;

namespace WorkoutTracker.API.Models
{
    public record ExerciseInWorkoutDTO(
        int Id, Guid ExerciseId, string ExerciseName, short NumberOfSets, SetType SetType, ResistanceType ResistanceType);
}
