using WorkoutTracker.API.Models;
using WorkoutTracker.Domain.Workouts;

namespace WorkoutTracker.API.Mappers
{
    public interface IExecutedWorkoutSummaryDTOMapper
    {
        ExecutedWorkoutSummaryDTO MapFromExecutedWorkout(ExecutedWorkout executedWorkout);
    }
}
