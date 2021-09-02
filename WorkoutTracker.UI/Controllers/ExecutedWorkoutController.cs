using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using WorkoutApplication.Domain.Exercises;
using WorkoutApplication.Domain.Workouts;
using WorkoutTracker.Application.FilterClasses;
using WorkoutTracker.Application.Workouts;
using WorkoutTracker.UI.Models;

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

        [HttpGet]
        public ActionResult<PaginatedResults<ExecutedWorkoutDTO>> Get(int userId, int firstRecord, short pageSize, DateTime? startDateTime = null, DateTime? endDateTime = null, bool newestFirst = true)
        {
            try
            {
                var filter = 
                    BuildExecutedWorkoutFilter(
                        userId, startDateTime, endDateTime);
                
                int totalCount = _executedWorkoutService.GetTotalCount(); //TODO: Modify to get total count by filter

                var executedWorkouts = 
                    _executedWorkoutService
                        .GetFilteredSubset(firstRecord, pageSize, filter, newestFirst)
                        .ToList();

                var results = executedWorkouts.Select((executedWorkout) =>
                {
                    return new ExecutedWorkoutDTO(
                        executedWorkout.Id, 
                        executedWorkout.Workout.Name, 
                        executedWorkout.WorkoutId, 
                        executedWorkout.StartDateTime, 
                        executedWorkout.EndDateTime);
                });

                var result = new PaginatedResults<ExecutedWorkoutDTO>(results, totalCount);

                return Ok(result);
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

        [HttpPut("{id}")]
        public ActionResult<ExecutedWorkout> Put([FromBody] ExecutedWorkout value)
        {
            try
            {
                return _executedWorkoutService.Update(value, true);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        private ExecutedWorkoutFilter BuildExecutedWorkoutFilter(
            int userId, 
            DateTime? startDateTime, 
            DateTime? endDateTime)
        {
            var filter = new ExecutedWorkoutFilter();

            filter.UserId = userId;

            if(filter.StartDateTime.HasValue)
                filter.StartDateTime = startDateTime;
            
            if(filter.EndDateTime.HasValue)
                filter.EndDateTime = endDateTime;

            return filter;
        }
    }
}