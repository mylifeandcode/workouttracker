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
                workout.Exercises?.Select(exercise => 
                    new ExerciseInWorkoutDTO(
                        exercise.Id, 
                        exercise.Exercise.PublicId,
                        exercise.Exercise.Name, 
                        exercise.NumberOfSets, 
                        exercise.SetType, 
                        exercise.Exercise.ResistanceType)),
                string.Join(", ",
                     workout.Exercises?.SelectMany(x =>
                        x.Exercise?.ExerciseTargetAreaLinks?.Select(x => x.TargetArea.Name))
                    .OrderBy(x => x)
                    .Distinct()),
                workout.Active);
        }
    }
}
