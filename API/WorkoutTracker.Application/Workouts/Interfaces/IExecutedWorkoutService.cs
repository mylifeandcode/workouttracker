using System.Collections.Generic;
using WorkoutTracker.Application.Workouts.Models;
using WorkoutTracker.Domain.Workouts;
using WorkoutTracker.Application.Shared.Interfaces;
using System;

namespace WorkoutTracker.Application.Workouts.Interfaces
{
    public interface IExecutedWorkoutService : IPublicEntityServiceBase<ExecutedWorkout>
    {
        ExecutedWorkout Create(WorkoutPlan plan, bool startWorkout);
        ExecutedWorkout Create(WorkoutPlan plan, DateTime startDateTime, DateTime endDateTime);
        IEnumerable<ExecutedWorkout> GetFilteredSubset(
            int firstRecordIndex, short subsetSize, ExecutedWorkoutFilter filter, bool newestFirst);
        IEnumerable<ExecutedWorkout> GetRecent(int numberOfMostRecent);
        ExecutedWorkout GetLatest(Guid workoutPublicId);
        int GetTotalCount(ExecutedWorkoutFilter filter);
        int GetPlannedCount(int userId);
        IEnumerable<ExecutedWorkout> GetInProgress(int userId);
        void DeletePlanned(Guid publicId);
        ExecutedWorkout GetByPublicId(Guid publicId);
    }
}
