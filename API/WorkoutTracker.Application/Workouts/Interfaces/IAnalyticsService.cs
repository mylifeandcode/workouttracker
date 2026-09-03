using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using WorkoutTracker.Application.Workouts.Models;

namespace WorkoutTracker.Application.Workouts.Interfaces
{
    public interface IAnalyticsService
    {
        Task<ExecutedWorkoutsSummary> GetExecutedWorkoutsSummaryAsync(int userId, CancellationToken cancellationToken = default);
        Task<List<ExecutedWorkoutMetrics>> GetExecutedWorkoutMetricsAsync(int workoutId, int count = 5, CancellationToken cancellationToken = default);
    }
}
