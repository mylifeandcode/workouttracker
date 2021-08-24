using System.Collections.Generic;
using WorkoutApplication.Application.Workouts;
using WorkoutApplication.Domain.Workouts;
using WorkoutTracker.Application.BaseClasses;
using WorkoutTracker.Application.FilterClasses;

namespace WorkoutTracker.Application.Workouts
{
    public interface IExecutedWorkoutService : IServiceBase<ExecutedWorkout>
    {
        ExecutedWorkout Create(int workoutId);
        ExecutedWorkout Create(WorkoutPlan plan);
        IEnumerable<ExecutedWorkout> GetFilteredSubset(
            int firstRecordIndex, short subsetSize, ExecutedWorkoutFilter filter, bool newestFirst);
        IEnumerable<ExecutedWorkout> GetRecent(int numberOfMostRecent);
        ExecutedWorkout GetLatest(int workoutId);
    }
}
