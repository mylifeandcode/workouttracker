using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using WorkoutTracker.Application.Shared.Interfaces;
using WorkoutTracker.Application.Workouts.Models;
using WorkoutTracker.Domain.Workouts;

namespace WorkoutTracker.Application.Workouts.Interfaces
{
    public interface IExecutedWorkoutService : IPublicEntityServiceBase<ExecutedWorkout>
    {
        Task<ExecutedWorkout> CreateAsync(WorkoutPlan plan, bool startWorkout);
        Task<ExecutedWorkout> CreateAsync(WorkoutPlan plan, DateTime startDateTime, DateTime endDateTime);
        Task<IEnumerable<ExecutedWorkout>> GetFilteredSubsetAsync(int firstRecordIndex, short subsetSize, ExecutedWorkoutFilter filter, bool newestFirst);
        Task<IEnumerable<ExecutedWorkout>> GetRecentAsync(int numberOfMostRecent);
        Task<ExecutedWorkout?> GetLatestAsync(Guid workoutPublicId);
        Task<int> GetTotalCountAsync(ExecutedWorkoutFilter filter);
        Task<int> GetPlannedCountAsync(int userId);
        Task<IEnumerable<ExecutedWorkout>> GetByUserAsync(int userId);
        Task<IEnumerable<ExecutedWorkout>> GetRecentByWorkoutAsync(int workoutId, int count);
        Task<IEnumerable<ExecutedWorkout>> GetInProgressAsync(int userId);
        Task DeletePlannedAsync(Guid publicId);
    }
}
