using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using WorkoutTracker.Application.Workouts.Interfaces;
using WorkoutTracker.Application.Workouts.Models;

namespace WorkoutTracker.API.Controllers
{
    [Produces("application/json")]
    [Route("api/[controller]")]
    [EnableCors("SiteCorsPolicy")]
    [Authorize]
    [ApiController]
    public class AnalyticsController : UserAwareController
    {
        private IAnalyticsService _analyticsService;
        private IWorkoutService _workoutService;

        public AnalyticsController(IAnalyticsService analyticsService, IWorkoutService workoutService)
        {
            _analyticsService = analyticsService ?? throw new ArgumentNullException(nameof(analyticsService));
            _workoutService = workoutService ?? throw new ArgumentNullException(nameof(workoutService));
        }

        [HttpGet("executed-workouts")]
        public ActionResult<ExecutedWorkoutsSummary> GetExecutedWorkoutsSummary()
        {
            int userId = this.GetUserID();
            var summary = _analyticsService.GetExecutedWorkoutsSummary(userId);
            return Ok(summary);
        }

        [HttpGet("workout-metrics/{workoutPublicId}/{count}")]
        public ActionResult<List<ExecutedWorkoutMetrics>> GetExecutedWorkoutMetrics(Guid workoutPublicId, int count = 5)
        {
            var workoutId = _workoutService.GetByPublicId(workoutPublicId).Id;
            var metrics = _analyticsService.GetExecutedWorkoutMetrics(workoutId, count);
            return Ok(metrics);
        }
    }
}
