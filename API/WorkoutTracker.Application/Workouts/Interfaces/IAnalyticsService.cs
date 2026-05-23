using System.Collections.Generic;
using System.Threading.Tasks;
using WorkoutTracker.Application.Workouts.Models;

namespace WorkoutTracker.Application.Workouts.Interfaces
{
    public interface IAnalyticsService
    {
        Task<ExecutedWorkoutsSummary> GetExecutedWorkoutsSummaryAsync(int userId);
        Task<List<ExecutedWorkoutMetrics>> GetExecutedWorkoutMetricsAsync(int workoutId, int count = 5);
    }
}
