using System.Collections.Generic;
using WorkoutTracker.Application.Workouts.Models;
using WorkoutTracker.Domain.Workouts;
using WorkoutTracker.Application.Shared.Interfaces;

namespace WorkoutTracker.Application.Workouts.Interfaces
{
    public interface IExecutedWorkoutService : IServiceBase<ExecutedWorkout>
    {
        ExecutedWorkout Create(WorkoutPlan plan);
        IEnumerable<ExecutedWorkout> GetFilteredSubset(
            int firstRecordIndex, short subsetSize, ExecutedWorkoutFilter filter, bool newestFirst);
        IEnumerable<ExecutedWorkout> GetRecent(int numberOfMostRecent);
        ExecutedWorkout GetLatest(int workoutId);
    }
}
