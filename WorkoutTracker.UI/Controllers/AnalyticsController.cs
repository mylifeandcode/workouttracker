using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
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

        public AnalyticsController(IExecutedWorkoutService executedWorkoutService)
        {
            _executedWorkoutService = executedWorkoutService ?? throw new ArgumentNullException(nameof(IExecutedWorkoutService));
        }

        [HttpGet("executed-workouts")]
        public ActionResult<ExecutedWorkoutsSummary> GetExecutedWorkoutsSummary()
        {
            var summary = new ExecutedWorkoutsSummary();
            int userId = this.GetUserID();
            /*
            summary.FirstLoggedWorkoutDateTime =
                _executedWorkoutService.GetAll()
                    .Where(x => x.CreatedByUserId == userId)
                    .OrderBy(x => x.StartDateTime).Take(1).FirstOrDefault()?.StartDateTime;
            */

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

            var x = GetCountOfWorkoutsByTargetArea(userId);

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
            */

            /*
            var executedExercises =
                _executedWorkoutService
                    .GetAll()
                    .Where(executedWorkout => executedWorkout.CreatedByUserId == userId)
                    .SelectMany(executedWorkout => executedWorkout.Exercises)
                    .SelectMany(executedExercise => executedExercise.Exercise.ExerciseTargetAreaLinks)
                    .Select(exerciseTargetAreaLink => exerciseTargetAreaLink.TargetArea.Name);
            */

            var executedExercisesList =
                _executedWorkoutService
                    .GetAll()
                    .Where(executedWorkout => executedWorkout.CreatedByUserId == userId && executedWorkout.EndDateTime.HasValue)
                    .ToList();

            var executedExercises = executedExercisesList
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

            /*
            var results =
                executedExercises
                    .GroupBy(x => new
                    {
                        TargetArea = x.TargetAreas.SelectMany(x => x),
                        Count = x.Count()
                    }
                    );
            */

            return null;

            /*
            var results =
                executedExercises
                    .GroupBy(x => 
                        new 
                        {
                            ExecutedWorkoutId = x.,
                            TargetAreaName = 
                                executedExercises
                                    .Where(executedExercise => ex)
                                    .SelectMany(executedExercise => executedExercise.Exercise.ExerciseTargetAreaLinks.Select(targetAreaLinks => targetAreaLinks.TargetArea.Name))

                        });
            */


            return null;

        }
    }
}
