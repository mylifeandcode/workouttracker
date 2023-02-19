using WorkoutTracker.API.Models;
using WorkoutTracker.Domain.Workouts;

namespace WorkoutTracker.API.Mappers
{
    public interface IExecutedWorkoutDTOMapper
    {
        ExecutedWorkoutDTO MapFromExecutedWorkout(ExecutedWorkout executedWorkout);
    }
}
