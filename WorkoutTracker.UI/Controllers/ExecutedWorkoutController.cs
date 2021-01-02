using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using WorkoutApplication.Domain.Workouts;
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

        // GET api/ExecutedWorkout/5
        [HttpGet("{id}")]
        public ActionResult<ExecutedWorkout> Get(int id)
        {
            try
            {
                var executedWorkout = _executedWorkoutService.GetById(id);
                if (executedWorkout == null)
                    return NotFound();
                else
                    return executedWorkout;
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        // GET api/ExecutedWorkout/5/new
        [HttpGet("new/{workoutId}")]
        public ActionResult<ExecutedWorkout> GetNew(int workoutId)
        {
            try
            {
                return _executedWorkoutService.Create(workoutId);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        // POST api/ExecutedWorkout
        [HttpPost]
        public ActionResult<ExecutedWorkout> Post([FromBody] ExecutedWorkout value)
        {
            try
            {
                return _executedWorkoutService.Add(value, true);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
    }
}