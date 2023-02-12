using WorkoutTracker.Domain.Workouts;
using WorkoutTracker.API.Models;

namespace WorkoutTracker.API.Adapters
{
    public interface IWorkoutDTOAdapter
    {
        WorkoutDTO AdaptFromWorkout(Workout workout);
    }
}
