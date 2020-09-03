using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using WorkoutApplication.Domain.Workouts;
using WorkoutTracker.Application.FilterClasses;
using WorkoutTracker.Application.Workouts;
using WorkoutTracker.UI.Models;

namespace WorkoutTracker.UI.Controllers
{
    [Produces("application/json")]
    [Route("api/Workouts")]
    [EnableCors("SiteCorsPolicy")]
    [ApiController]
    public class WorkoutController : ControllerBase
    {
        private IWorkoutService _workoutService;

        public WorkoutController(IWorkoutService workoutService)
        {
            _workoutService = workoutService ?? throw new ArgumentNullException("workoutService");
        }

        // GET: api/Workouts
        [HttpGet]
        public ActionResult<PaginatedResults<WorkoutDTO>> Get(int firstRecord, short pageSize, int userId, string nameContains = null)
        {
            try
            {
                var filter = BuildWorkoutFilter(userId, nameContains);
                var result = new PaginatedResults<WorkoutDTO>();

                result.TotalCount = _workoutService.GetTotalCount(); //TODO: Modify to get total count by filter

                //Blows up after upgrading to EF Core 3.1 from 2.2!
                //More info at https://stackoverflow.com/questions/59677609/problem-with-ef-core-after-migrating-from-2-2-to-3-1
                //Had to add .ToList() to the call below.
                var workouts = _workoutService.Get(firstRecord, pageSize, filter).ToList();

                result.Results = workouts.Select((workout) =>
                {
                    var dto = new WorkoutDTO();
                    dto.Id = workout.Id;
                    dto.Name = workout.Name;
                    dto.Exercises = workout.Exercises.Select(exercise => new ExerciseInWorkoutDTO(exercise));
                    return dto;
                });
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        // GET api/Workouts/5
        [HttpGet("{id}")]
        public ActionResult<Workout> Get(int id)
        {
            try
            {
                var exercise = _workoutService.GetById(id);
                if (exercise == null)
                    return NotFound(id);
                else
                    return Ok(exercise);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        // POST api/Workouts
        [HttpPost]
        public ActionResult<Workout> Post([FromBody]Workout value)
        {
            try
            {
                return Ok(_workoutService.Add(value, true));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        // PUT api/Workouts/5
        [HttpPut("{id}")]
        public ActionResult<Workout> Put(int id, [FromBody]Workout value)
        {
            try
            {
                return Ok(_workoutService.Update(value, true));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        // DELETE api/Workouts/5
        [HttpDelete("{id}")]
        public ActionResult Delete(int id)
        {
            throw new NotImplementedException();
        }

        private WorkoutFilter BuildWorkoutFilter(int userId, string nameContains)
        {
            var filter = new WorkoutFilter();

            filter.UserId = userId;

            if (!String.IsNullOrWhiteSpace(nameContains))
                filter.NameContains = nameContains;

            return filter;
        }
    }
}