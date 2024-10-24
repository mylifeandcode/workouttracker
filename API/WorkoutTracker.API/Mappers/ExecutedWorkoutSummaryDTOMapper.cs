using System;
using WorkoutTracker.API.Models;
using WorkoutTracker.Domain.Workouts;

namespace WorkoutTracker.API.Mappers
{
    public class ExecutedWorkoutSummaryDTOMapper : IExecutedWorkoutSummaryDTOMapper
    {
        public ExecutedWorkoutSummaryDTO MapFromExecutedWorkout(ExecutedWorkout executedWorkout)
        {
            if (executedWorkout == null) throw new ArgumentNullException(nameof(executedWorkout));

            return new ExecutedWorkoutSummaryDTO(
                        executedWorkout.PublicId,
                        executedWorkout.CreatedDateTime,
                        executedWorkout.ModifiedDateTime,
                        executedWorkout.Workout.Name,
                        executedWorkout.Workout.PublicId,
                        executedWorkout.StartDateTime,
                        executedWorkout.EndDateTime,
                        executedWorkout.Journal);
        }
    }
}
