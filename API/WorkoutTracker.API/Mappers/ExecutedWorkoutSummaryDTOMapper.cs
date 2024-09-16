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
                        executedWorkout.Id,
                        executedWorkout.Workout.Name,
                        executedWorkout.WorkoutId,
                        executedWorkout.StartDateTime,
                        executedWorkout.EndDateTime,
                        executedWorkout.CreatedDateTime,
                        executedWorkout.Journal,
                        executedWorkout.PublicId);
        }
    }
}
