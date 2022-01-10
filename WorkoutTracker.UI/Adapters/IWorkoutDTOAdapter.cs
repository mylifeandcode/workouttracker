using WorkoutApplication.Domain.Workouts;
using WorkoutTracker.UI.Models;

namespace WorkoutTracker.UI.Adapters
{
    public interface IWorkoutDTOAdapter
    {
        WorkoutDTO AdaptFromWorkout(Workout workout);
    }
}
