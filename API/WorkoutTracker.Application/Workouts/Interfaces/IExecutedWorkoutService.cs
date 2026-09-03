using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using WorkoutTracker.Application.Shared.Interfaces;
using WorkoutTracker.Application.Workouts.Models;
using WorkoutTracker.Domain.Workouts;

namespace WorkoutTracker.Application.Workouts.Interfaces
{
    public interface IExecutedWorkoutService : IPublicEntityServiceBase<ExecutedWorkout>
    {
        Task<ExecutedWorkout> CreateAsync(WorkoutPlan plan, bool startWorkout, CancellationToken cancellationToken = default);
        Task<ExecutedWorkout> CreateAsync(WorkoutPlan plan, DateTime startDateTime, DateTime endDateTime, CancellationToken cancellationToken = default);
        Task<IEnumerable<ExecutedWorkout>> GetFilteredSubsetAsync(int firstRecordIndex, short subsetSize, ExecutedWorkoutFilter filter, bool newestFirst, CancellationToken cancellationToken = default);
        Task<IEnumerable<ExecutedWorkout>> GetRecentAsync(int numberOfMostRecent, CancellationToken cancellationToken = default);
        Task<ExecutedWorkout?> GetLatestAsync(Guid workoutPublicId, CancellationToken cancellationToken = default);
        Task<int> GetTotalCountAsync(ExecutedWorkoutFilter filter, CancellationToken cancellationToken = default);
        Task<int> GetPlannedCountAsync(int userId, CancellationToken cancellationToken = default);
        Task<DateTime?> GetFirstStartDateTimeByUserAsync(int userId, CancellationToken cancellationToken = default);
        Task<int> GetLoggedWorkoutCountByUserAsync(int userId, CancellationToken cancellationToken = default);
        Task<IEnumerable<ExecutedWorkout>> GetRecentByWorkoutAsync(int workoutId, int count, CancellationToken cancellationToken = default);
        Task<IEnumerable<ExecutedWorkout>> GetInProgressAsync(int userId, CancellationToken cancellationToken = default);
        Task DeletePlannedAsync(Guid publicId, CancellationToken cancellationToken = default);
    }
}
