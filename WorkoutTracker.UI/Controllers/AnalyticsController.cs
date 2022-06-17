using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using WorkoutTracker.Application.Workouts.Interfaces;
using WorkoutTracker.Application.Workouts.Models;

namespace WorkoutTracker.UI.Controllers
{
    [Produces("application/json")]
    [Route("api/[controller]")]
    [EnableCors("SiteCorsPolicy")]
    [Authorize]
    [ApiController]
    public class AnalyticsController : UserAwareController
    {
        private IAnalyticsService _analyticsService;

        public AnalyticsController(IAnalyticsService analyticsService)
        {
            _analyticsService = analyticsService ?? throw new ArgumentNullException(nameof(analyticsService));
        }

        [HttpGet("executed-workouts")]
        public ActionResult<ExecutedWorkoutsSummary> GetExecutedWorkoutsSummary()
        {
            int userId = this.GetUserID();
            var summary = _analyticsService.GetExecutedWorkoutsSummary(userId);
            return Ok(summary);
        }

        [HttpGet("workout-metrics/{workoutId}/{count}")]
        public ActionResult<List<ExecutedWorkoutMetrics>> GetExecutedWorkoutMetrics(int workoutId, int count = 5)
        {
            var metrics = _analyticsService.GetExecutedWorkoutMetrics(workoutId, count);
            return Ok(metrics);
        }
    }
}
