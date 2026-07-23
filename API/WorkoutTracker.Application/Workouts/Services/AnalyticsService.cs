using System;
using System.Collections.Generic;
using System.Linq;
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

        public async Task<List<ExecutedWorkoutMetrics>> GetExecutedWorkoutMetricsAsync(int workoutId, int count = 5)
        {
            var executedWorkouts = await GetRecentExecutedWorkoutsAsync(workoutId, count);
            var output = new List<ExecutedWorkoutMetrics>(executedWorkouts.Count);

            executedWorkouts.ForEach(x => output.Add(new ExecutedWorkoutMetrics(x)));

            return output.OrderBy(x => x.EndDateTime).ToList();
        }

        public async Task<ExecutedWorkoutsSummary> GetExecutedWorkoutsSummaryAsync(int userId)
        {
            var summary = new ExecutedWorkoutsSummary();
            var allWorkouts = (await _executedWorkoutService.GetByUserAsync(userId)).ToList();

            var firstWorkout = allWorkouts
                .Where(x => x.StartDateTime.HasValue)
                .OrderBy(x => x.StartDateTime)
                .FirstOrDefault();

            if (firstWorkout != null)
                summary.FirstLoggedWorkoutDateTime = firstWorkout.StartDateTime;

            summary.TotalLoggedWorkouts = allWorkouts.Count;

            summary.TargetAreasWithWorkoutCounts = await GetCountOfWorkoutsByTargetAreaAsync(userId);

            return summary;
        }

        #region Private Methods

        private async Task<Dictionary<string, int>> GetCountOfWorkoutsByTargetAreaAsync(int userId)
        {
            var workoutCountsByTargetArea = await _analyticsRepository.GetWorkoutCountsByTargetAreaAsync(userId);
            var allTargetAreas = (await _targetAreaService.GetAllAsync()).OrderBy(x => x.Name).ToList();
            var output = new Dictionary<string, int>(allTargetAreas.Count);

            foreach (var area in allTargetAreas)
            {
                var matchingCount = workoutCountsByTargetArea.Find(x => x.Name == area.Name);
                output.Add(area.Name, matchingCount?.ExecutedWorkoutCount ?? 0);
            }

            return output;
        }

        private async Task<List<ExecutedWorkout>> GetRecentExecutedWorkoutsAsync(int workoutId, int count = 5)
        {
            return [.. await _executedWorkoutService.GetRecentByWorkoutAsync(workoutId, count)];
        }

        #endregion Private Methods
    }
}
