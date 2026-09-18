using System;
using System.Collections.Generic;
using System.Linq;
using WorkoutTracker.Domain.Workouts;
using WorkoutTracker.API.Models;

namespace WorkoutTracker.API.Mappers
{
    public class WorkoutDTOMapper : IWorkoutDTOMapper
    {
        public WorkoutDTO MapFromWorkout(Workout workout)
        {
            if (workout == null) throw new ArgumentNullException(nameof(workout));

            return new WorkoutDTO(
                workout.PublicId,
                workout.CreatedDateTime,
                workout.ModifiedDateTime,
                workout.Name,
                string.Join(", ",
                     workout.Exercises?.SelectMany(x =>
                        x.Exercise?.ExerciseTargetAreaLinks?.Select(x => x.TargetArea.Name))
                    .OrderBy(x => x)
                    .Distinct()),
                workout.Active);
        }

        public WorkoutDetailDTO MapToDetailDTO(Workout workout)
        {
            if (workout == null) throw new ArgumentNullException(nameof(workout));

            return new WorkoutDetailDTO(
                workout.Id,
                workout.PublicId,
                workout.CreatedByUserId,
                workout.CreatedDateTime,
                workout.ModifiedDateTime,
                workout.Name,
                workout.Active,
                workout.Exercises?.Select(exerciseInWorkout => new ExerciseInWorkoutDetailDTO(
                    exerciseInWorkout.Id,
                    exerciseInWorkout.ExerciseId,
                    exerciseInWorkout.Exercise?.Name,
                    exerciseInWorkout.NumberOfSets,
                    exerciseInWorkout.SetType,
                    exerciseInWorkout.Exercise?.ResistanceType ?? default,
                    exerciseInWorkout.Exercise?.ExerciseTargetAreaLinks?.Select(link => link.TargetArea?.Name ?? string.Empty) ?? Enumerable.Empty<string>())
                ) ?? Enumerable.Empty<ExerciseInWorkoutDetailDTO>());
        }
    }
}
