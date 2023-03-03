using System;
using System.Linq;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using WorkoutTracker.Application.Workouts.Models;
using WorkoutTracker.Domain.Workouts;
using WorkoutTracker.Application.Workouts.Interfaces;
using WorkoutTracker.API.Mappers;
using WorkoutTracker.API.Models;

namespace WorkoutTracker.API.Controllers
{
    [Produces("application/json")]
    [Route("api/Workouts")]
    [EnableCors("SiteCorsPolicy")]
    [Authorize]
    [ApiController]
    public class WorkoutController : UserAwareController
    {
        private IWorkoutService _workoutService;
        private IWorkoutPlanService _workoutPlanService;
        private IExecutedWorkoutService _executedWorkoutService;
        private IWorkoutDTOMapper _workoutDTOMapper;

        public WorkoutController(
            IWorkoutService workoutService, 
            IWorkoutPlanService workoutPlanService, 
            IExecutedWorkoutService executedWorkoutService, 
            IWorkoutDTOMapper workoutDTOMapper)
        {
            _workoutService = workoutService ?? throw new ArgumentNullException(nameof(workoutService));
            _workoutPlanService = workoutPlanService ?? throw new ArgumentNullException(nameof(workoutPlanService));
            _executedWorkoutService = executedWorkoutService ?? throw new ArgumentNullException(nameof(executedWorkoutService));
            _workoutDTOMapper = workoutDTOMapper ?? throw new ArgumentNullException(nameof(workoutDTOMapper));
        }

        // GET: api/Workouts
        [HttpGet]
        public ActionResult<PaginatedResults<WorkoutDTO>> Get(int firstRecord, short pageSize, bool activeOnly, string nameContains = null)
        {
            try
            {
                //TODO: Consolidate this code somewhere!
                var userId = GetUserID();

                var filter = BuildWorkoutFilter(userId, activeOnly, nameContains);

                int totalCount = _workoutService.GetTotalCount(filter);

                //Blows up after upgrading to EF Core 3.1 from 2.2!
                //More info at https://stackoverflow.com/questions/59677609/problem-with-ef-core-after-migrating-from-2-2-to-3-1
                //Had to add .ToList() to the call below.
                var workouts = 
                    _workoutService
                        .Get(firstRecord, pageSize, filter)
                        .OrderBy(x => x.Name);

                var results = workouts.Select((workout) =>
                {
                    return _workoutDTOMapper.MapFromWorkout(workout);
                });

                var result = new PaginatedResults<WorkoutDTO>(results, totalCount);
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
                var workout = _workoutService.GetById(id);
                if (workout == null)
                    return NotFound(id);
                else
                {
                    workout.Exercises = workout.Exercises?.OrderBy(x => x.Sequence).ToList();
                    return Ok(workout);
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpGet("DTO/{id}")]
        public ActionResult<WorkoutDTO> GetDTO(int id)
        {
            try
            {
                var workout = _workoutService.GetById(id);
                if (workout == null)
                    return NotFound(id);

                var dto = _workoutDTOMapper.MapFromWorkout(workout);

                return Ok(dto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpGet("{id}/plan")]
        public ActionResult<WorkoutPlan> GetPlan(int id)
        {
            try
            {
                var plan = _workoutPlanService.Create(id, this.GetUserID());
                return Ok(plan);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPost("{id}/plan")]
        public ActionResult<int> SubmitPlan([FromBody] WorkoutPlan plan)
        {
            //TODO: Change URL -- id isn't needed
            return CreateWorkoutFromWorkoutPlan(plan, true);
        }

        [HttpPost("{id}/plan-for-later")]
        public ActionResult<int> SubmitPlanForLater([FromBody] WorkoutPlan plan)
        {
            //TODO: Change URL -- id isn't needed
            return CreateWorkoutFromWorkoutPlan(plan, false);
        }

        [HttpPost("{id}/plan-for-past/{startDateTime}/{endDateTime}")]
        public ActionResult<int> SubmitPlanForPast([FromBody] WorkoutPlan plan, DateTime startDateTime, DateTime endDateTime) {
            //TODO: Change URL -- id isn't needed
            return CreateWorkoutFromWorkoutPlanForPast(plan, startDateTime, endDateTime);
        }

        // POST api/Workouts
        [HttpPost]
        public ActionResult<Workout> Post([FromBody]Workout value)
        {
            try
            {
                SetCreatedAuditFields(value);
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
                SetModifiedAuditFields(value);
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

        [HttpPut("{id}/retire")]
        public ActionResult Retire(int id)
        {
            try
            {
                _workoutService.Retire(id);
                return Ok();
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPut("{id}/reactivate")]
        public ActionResult Reactivate(int id)
        {
            try
            {
                _workoutService.Reactivate(id);
                return Ok();
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        private WorkoutFilter BuildWorkoutFilter(int userId, bool activeOnly, string nameContains)
        {
            var filter = new WorkoutFilter();

            filter.UserId = userId;
            filter.ActiveOnly = activeOnly;

            if (!String.IsNullOrWhiteSpace(nameContains))
                filter.NameContains = nameContains;

            return filter;
        }

        private ActionResult<int> CreateWorkoutFromWorkoutPlan(WorkoutPlan plan, bool startWorkout)
        {
            try
            {
                var executedWorkout = _executedWorkoutService.Create(plan, startWorkout);
                return Ok(executedWorkout.Id);

            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        private ActionResult<int> CreateWorkoutFromWorkoutPlanForPast(WorkoutPlan plan, DateTime startDateTime, DateTime endDateTime)
        {
            try
            {
                var executedWorkout = _executedWorkoutService.Create(plan, startDateTime, endDateTime);
                return Ok(executedWorkout.Id);

            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
    }
}