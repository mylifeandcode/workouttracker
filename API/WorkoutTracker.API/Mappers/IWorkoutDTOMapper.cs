using WorkoutTracker.Domain.Workouts;
using WorkoutTracker.API.Models;

namespace WorkoutTracker.API.Mappers
{
    public interface IWorkoutDTOMapper
    {
        WorkoutDTO MapFromWorkout(Workout workout);
    }
}
