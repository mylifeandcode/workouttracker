using WorkoutApplication.Domain.Workouts;
using WorkoutTracker.Application.BaseClasses;

namespace WorkoutTracker.Application.Workouts
{
    public interface IExecutedWorkoutService : IServiceBase<ExecutedWorkout>
    {
        ExecutedWorkout Create(int workoutId);
    }
}
