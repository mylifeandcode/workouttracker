using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using WorkoutTracker.Application.Exercises.Interfaces;
using WorkoutTracker.Application.Workouts.Interfaces;
using WorkoutTracker.Application.Workouts.Models;
using WorkoutTracker.Domain.Workouts;

namespace WorkoutTracker.Application.Workouts.Services
{
    public class AnalyticsService : IAnalyticsService
    {
        private IExecutedWorkoutService _executedWorkoutService;
        private ITargetAreaService _targetAreaService;
        public AnalyticsService(
            IExecutedWorkoutService executedWorkoutService,
            ITargetAreaService targetAreaService)
        {
            _executedWorkoutService = executedWorkoutService ?? throw new ArgumentNullException(nameof(executedWorkoutService));
            _targetAreaService = targetAreaService ?? throw new ArgumentNullException(nameof(targetAreaService));
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

            summary.TargetAreasWithWorkoutCounts = await GetCountOfWorkoutsByTargetAreaAsync(allWorkouts);

            return summary;
        }

        #region Private Methods

        private async Task<Dictionary<string, int>> GetCountOfWorkoutsByTargetAreaAsync(List<ExecutedWorkout> allWorkouts)
        {
            //TODO: Convert back to SQL. This is one of those cases where it's better to make a SQL call than use an O/RM.
            /*
            In SQL, the query looks like this:
            
            select	ta.Name, count(distinct(ew.Id)) as ExecutedWorkoutCount
            from	TargetAreas ta
            join	ExerciseTargetAreaLinks etal on ta.Id = etal.TargetAreaId
            join	Exercises ex on ex.Id = etal.ExerciseId
            join	ExecutedExercises exex on exex.ExerciseId = ex.Id
            join	ExecutedWorkouts ew on ew.id = exex.ExecutedWorkoutId
            group by ta.Name
            order by ta.Name

            I couldn't figure out a way to do this in LINQ, and didn't want to resort to doing a straight SQL call, so I took the 
            less-than-ideal approach below.
            */
            var executedWorkoutIdsWithTargetAreas =
                allWorkouts
                    .Where(executedWorkout => executedWorkout.EndDateTime.HasValue)
                    .Select(executedWorkout =>
                        new
                        {
                            ExecutedWorkoutId = executedWorkout.Id,
                            TargetAreas =
                                executedWorkout
                                    .Exercises
                                    .SelectMany(executedExercise => executedExercise.Exercise.ExerciseTargetAreaLinks.Select(targetAreaLinks => targetAreaLinks.TargetArea.Name))
                                    .Distinct().ToList()
                        })
                    .Distinct()
                    .ToList();

            var allTargetAreas = (await _targetAreaService.GetAllAsync()).OrderBy(x => x.Name).ToList();
            var output = new Dictionary<string, int>(allTargetAreas.Count);

            foreach (var area in allTargetAreas)
            {
                output.Add(area.Name, executedWorkoutIdsWithTargetAreas.Count(x => x.TargetAreas.Contains(area.Name)));
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
