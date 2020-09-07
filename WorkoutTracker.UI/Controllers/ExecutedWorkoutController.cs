using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using WorkoutTracker.Application.Workouts;

namespace WorkoutTracker.UI.Controllers
{
    [Produces("application/json")]
    [Route("api/[controller]")]
    [EnableCors("SiteCorsPolicy")]
    [ApiController]
    public class ExecutedWorkoutController : ControllerBase
    {
        private IExecutedWorkoutService _executedWorkoutService;

        public ExecutedWorkoutController(IExecutedWorkoutService executedWorkoutService)
        {
            _executedWorkoutService = executedWorkoutService ?? throw new ArgumentNullException("executedWorkoutService");
        }
    }
}