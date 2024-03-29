﻿using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
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
        private ILogger<AnalyticsService> _logger;

        public AnalyticsService(
            IExecutedWorkoutService executedWorkoutService, 
            ITargetAreaService targetAreaService,
            ILogger<AnalyticsService> logger)
        {
            _executedWorkoutService = executedWorkoutService ?? throw new ArgumentNullException(nameof(executedWorkoutService));
            _targetAreaService = targetAreaService ?? throw new ArgumentNullException(nameof(targetAreaService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public List<ExecutedWorkoutMetrics> GetExecutedWorkoutMetrics(int workoutId, int count = 5)
        {
            var executedWorkouts = GetRecentExecutedWorkouts(workoutId, count).ToList();
            var output = new List<ExecutedWorkoutMetrics>(executedWorkouts.Count);

            executedWorkouts.ForEach(x => output.Add(new ExecutedWorkoutMetrics(x)));
            
            return output.OrderBy(x => x.EndDateTime).ToList();
        }

        public ExecutedWorkoutsSummary GetExecutedWorkoutsSummary(int userId)
        {
            var summary = new ExecutedWorkoutsSummary();
            var firstWorkout =
                _executedWorkoutService
                    .GetAll()
                    .Where(x => x.CreatedByUserId == userId && x.StartDateTime.HasValue)
                    .OrderBy(x => x.StartDateTime)
                    .FirstOrDefault();

            if (firstWorkout != null)
                summary.FirstLoggedWorkoutDateTime = firstWorkout.StartDateTime;

            summary.TotalLoggedWorkouts =
                _executedWorkoutService
                    .GetAll()
                    .Where(x => x.CreatedByUserId == userId)
                    .Count();

            summary.TargetAreasWithWorkoutCounts = GetCountOfWorkoutsByTargetArea(userId);

            return summary;
        }

        #region Private Methods
        private Dictionary<string, int> GetCountOfWorkoutsByTargetArea(int userId)
        {
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

            //TODO: Convert back to SQL. This is one of those cases where it's better to make a SQL call than use an O/RM.

            var executedWorkoutIdsWithTargetAreas =
                _executedWorkoutService
                    .GetAll()
                    .Where(executedWorkout => executedWorkout.CreatedByUserId == userId && executedWorkout.EndDateTime.HasValue)
                    .ToList()
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

            var allTargetAreas = _targetAreaService.GetAll().OrderBy(x => x.Name).ToList();
            var output = new Dictionary<string, int>(allTargetAreas.Count);

            foreach (var area in allTargetAreas)
            {
                output.Add(area.Name, executedWorkoutIdsWithTargetAreas.Count(x => x.TargetAreas.Contains(area.Name)));
            }

            return output;
        }

        private IEnumerable<ExecutedWorkout> GetRecentExecutedWorkouts(int workoutId, int count = 5)
        {
            return _executedWorkoutService
                    .GetAll()
                    .Where(x => x.WorkoutId == workoutId && x.EndDateTime.HasValue)
                    .OrderByDescending(x => x.EndDateTime)
                    .Take(count);
        }
        #endregion Private Methods
    }
}
