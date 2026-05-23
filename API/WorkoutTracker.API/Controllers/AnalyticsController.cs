using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
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
        public async Task<ActionResult<ExecutedWorkoutsSummary>> GetExecutedWorkoutsSummary()
        {
            int userId = this.GetUserID();
            var summary = await _analyticsService.GetExecutedWorkoutsSummaryAsync(userId);
            return Ok(summary);
        }

        [HttpGet("workout-metrics/{workoutPublicId}/{count}")]
        public async Task<ActionResult<List<ExecutedWorkoutMetrics>>> GetExecutedWorkoutMetrics(Guid workoutPublicId, int count = 5)
        {
            var workout = await _workoutService.GetByPublicIDAsync(workoutPublicId);
            var metrics = await _analyticsService.GetExecutedWorkoutMetricsAsync(workout.Id, count);
            return Ok(metrics);
        }
    }
}
