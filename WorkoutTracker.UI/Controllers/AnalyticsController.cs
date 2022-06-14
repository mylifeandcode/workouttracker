using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using WorkoutTracker.Application.Exercises.Interfaces;
using WorkoutTracker.Application.Workouts.Interfaces;
using WorkoutTracker.UI.Models;

namespace WorkoutTracker.UI.Controllers
{
    [Produces("application/json")]
    [Route("api/[controller]")]
    [EnableCors("SiteCorsPolicy")]
    [Authorize]
    [ApiController]
    public class AnalyticsController : UserAwareController
    {
        private IExecutedWorkoutService _executedWorkoutService;
        private ITargetAreaService _targetAreaService;

        public AnalyticsController(IExecutedWorkoutService executedWorkoutService, ITargetAreaService targetAreaService)
        {
            _executedWorkoutService = executedWorkoutService ?? throw new ArgumentNullException(nameof(IExecutedWorkoutService));
            _targetAreaService = targetAreaService ?? throw new ArgumentNullException(nameof(ITargetAreaService));
        }

        [HttpGet("executed-workouts")]
        public ActionResult<ExecutedWorkoutsSummary> GetExecutedWorkoutsSummary()
        {
            var summary = new ExecutedWorkoutsSummary();
            int userId = this.GetUserID();

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

            return Ok(summary);
        }

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

            //TODO: Find a better way to do this.

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
    }
}
