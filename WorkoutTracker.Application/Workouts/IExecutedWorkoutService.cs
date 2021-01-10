using System.Collections.Generic;
using WorkoutApplication.Domain.Workouts;
using WorkoutTracker.Application.BaseClasses;
using WorkoutTracker.Application.FilterClasses;

namespace WorkoutTracker.Application.Workouts
{
    public interface IExecutedWorkoutService : IServiceBase<ExecutedWorkout>
    {
        ExecutedWorkout Create(int workoutId);
        IEnumerable<ExecutedWorkout> GetFilteredSubset(int firstRecordIndex, short subsetSize, ExecutedWorkoutFilter filter);
    }
}
