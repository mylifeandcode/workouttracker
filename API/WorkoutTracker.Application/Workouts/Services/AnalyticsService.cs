using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using WorkoutTracker.Application.Exercises.Interfaces;
using WorkoutTracker.Application.Workouts.Interfaces;
using WorkoutTracker.Application.Workouts.Models;
using WorkoutTracker.Domain.Workouts;
using WorkoutTracker.Repository;

namespace WorkoutTracker.Application.Workouts.Services
{
    public class AnalyticsService : IAnalyticsService
    {
        private IExecutedWorkoutService _executedWorkoutService;
        private ITargetAreaService _targetAreaService;
        private IAnalyticsRepository _analyticsRepository;
        public AnalyticsService(
            IExecutedWorkoutService executedWorkoutService,
            ITargetAreaService targetAreaService,
            IAnalyticsRepository analyticsRepository)
        {
            _executedWorkoutService = executedWorkoutService ?? throw new ArgumentNullException(nameof(executedWorkoutService));
            _targetAreaService = targetAreaService ?? throw new ArgumentNullException(nameof(targetAreaService));
            _analyticsRepository = analyticsRepository ?? throw new ArgumentNullException(nameof(analyticsRepository));
        }

        public async Task<List<ExecutedWorkoutMetrics>> GetExecutedWorkoutMetricsAsync(int workoutId, int count = 5, CancellationToken cancellationToken = default)
        {
            var executedWorkouts = await GetRecentExecutedWorkoutsAsync(workoutId, count, cancellationToken);
            var output = new List<ExecutedWorkoutMetrics>(executedWorkouts.Count);

            executedWorkouts.ForEach(x => output.Add(new ExecutedWorkoutMetrics(x)));

            return output.OrderBy(x => x.EndDateTime).ToList();
        }

        public async Task<ExecutedWorkoutsSummary> GetExecutedWorkoutsSummaryAsync(int userId, CancellationToken cancellationToken = default)
        {
            var summary = new ExecutedWorkoutsSummary();

            summary.FirstLoggedWorkoutDateTime = await _executedWorkoutService.GetFirstStartDateTimeByUserAsync(userId, cancellationToken);
            summary.TotalLoggedWorkouts = await _executedWorkoutService.GetLoggedWorkoutCountByUserAsync(userId, cancellationToken);
            summary.TargetAreasWithWorkoutCounts = await GetCountOfWorkoutsByTargetAreaAsync(userId, cancellationToken);

            return summary;
        }

        #region Private Methods

        private async Task<Dictionary<string, int>> GetCountOfWorkoutsByTargetAreaAsync(int userId, CancellationToken cancellationToken = default)
        {
            var workoutCountsByTargetArea = await _analyticsRepository.GetWorkoutCountsByTargetAreaAsync(userId, cancellationToken);
            var allTargetAreas = (await _targetAreaService.GetAllAsync(cancellationToken)).OrderBy(x => x.Name).ToList();
            var output = new Dictionary<string, int>(allTargetAreas.Count);

            foreach (var area in allTargetAreas)
            {
                var matchingCount = workoutCountsByTargetArea.Find(x => x.Name == area.Name);
                output.Add(area.Name, matchingCount?.ExecutedWorkoutCount ?? 0);
            }

            return output;
        }

        private async Task<List<ExecutedWorkout>> GetRecentExecutedWorkoutsAsync(int workoutId, int count = 5, CancellationToken cancellationToken = default)
        {
            return [.. await _executedWorkoutService.GetRecentByWorkoutAsync(workoutId, count, cancellationToken)];
        }

        #endregion Private Methods
    }
}
