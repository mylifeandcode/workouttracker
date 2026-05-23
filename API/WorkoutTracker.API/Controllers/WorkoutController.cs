using System;
using System.Linq;
using System.Threading.Tasks;
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
        public async Task<ActionResult<PaginatedResults<WorkoutDTO>>> Get(int firstRecord, short pageSize, bool activeOnly, bool sortAscending = true, string nameContains = null)
        {
            try
            {
                var userId = GetUserID();

                var filter = BuildWorkoutFilter(userId, activeOnly, nameContains);

                int totalCount = await _workoutService.GetTotalCountAsync(filter);

                var workouts = (await _workoutService.GetAsync(firstRecord, pageSize, filter));
                var sortedWorkouts = sortAscending
                    ? workouts.OrderBy(x => x.Name)
                    : workouts.OrderByDescending(x => x.Name);

                var results = sortedWorkouts.Select((workout) =>
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

        /*
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
                    if (workout.CreatedByUserId != GetUserID())
                        return Forbid();

                    workout.Exercises = workout.Exercises?.OrderBy(x => x.Sequence).ToList();
                    return Ok(workout);
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
        */

        [HttpGet("{publicId}")]
        public async Task<ActionResult<Workout>> GetByPublicId(Guid publicId)
        {
            try
            {
                var workout = await _workoutService.GetByPublicIDAsync(publicId);
                if (workout == null)
                    return NotFound(publicId);
                else
                {
                    if (workout.CreatedByUserId != GetUserID())
                        return Forbid();

                    workout.Exercises = workout.Exercises?.OrderBy(x => x.Sequence).ToList();
                    return Ok(workout);
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        /*
        [HttpGet("DTO/{id}")]
        public ActionResult<WorkoutDTO> GetDTO(int id)
        {
            try
            {
                var workout = _workoutService.GetById(id);
                if (workout == null)
                    return NotFound(id);

                if (workout.CreatedByUserId != GetUserID())
                    return Forbid();

                var dto = _workoutDTOMapper.MapFromWorkout(workout);

                return Ok(dto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
        */

        [HttpGet("{workoutPublicId}/plan")]
        public async Task<ActionResult<WorkoutPlan>> GetNewPlan(Guid workoutPublicId)
        {
            try
            {
                var plan = await _workoutPlanService.CreateAsync(workoutPublicId, this.GetUserID());
                return Ok(plan);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPost("plan")]
        public async Task<ActionResult<Guid>> SubmitPlan([FromBody] WorkoutPlan plan)
        {
            return await CreateWorkoutFromWorkoutPlanAsync(plan, true);
        }

        [HttpPost("plan-for-later")]
        public async Task<ActionResult<Guid>> SubmitPlanForLater([FromBody] WorkoutPlan plan)
        {
            return await CreateWorkoutFromWorkoutPlanAsync(plan, false);
        }

        [HttpPost("plan-for-past/{startDateTime}/{endDateTime}")]
        public async Task<ActionResult<Guid>> SubmitPlanForPast([FromBody] WorkoutPlan plan, DateTime startDateTime, DateTime endDateTime) {
            return await CreateWorkoutFromWorkoutPlanForPastAsync(plan, startDateTime, endDateTime);
        }

        // POST api/Workouts
        [HttpPost]
        public async Task<ActionResult<Workout>> Post([FromBody]Workout value)
        {
            try
            {
                SetCreatedAuditFields(value);
                return Ok(await _workoutService.AddAsync(value, true));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        // PUT api/Workouts
        [HttpPut]
        public async Task<ActionResult<Workout>> Put([FromBody]Workout value)
        {
            try
            {
                SetModifiedAuditFields(value);
                return Ok(await _workoutService.UpdateAsync(value, true));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        // DELETE api/Workouts/some-guid
        [HttpDelete("{publicId}")]
        public ActionResult Delete(Guid publicId)
        {
            throw new NotImplementedException();
        }

        [HttpPut("{publicId}/retire")]
        public async Task<ActionResult> Retire(Guid publicId)
        {
            try
            {
                await _workoutService.RetireAsync(publicId);
                return Ok();
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPut("{publicId}/reactivate")]
        public async Task<ActionResult> Reactivate(Guid publicId)
        {
            try
            {
                await _workoutService.ReactivateAsync(publicId);
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

        private async Task<ActionResult<Guid>> CreateWorkoutFromWorkoutPlanAsync(WorkoutPlan plan, bool startWorkout)
        {
            try
            {
                var executedWorkout = await _executedWorkoutService.CreateAsync(plan, startWorkout);
                return Ok(executedWorkout.PublicId);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        private async Task<ActionResult<Guid>> CreateWorkoutFromWorkoutPlanForPastAsync(WorkoutPlan plan, DateTime startDateTime, DateTime endDateTime)
        {
            try
            {
                var executedWorkout = await _executedWorkoutService.CreateAsync(plan, startDateTime, endDateTime);
                return Ok(executedWorkout.PublicId);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
    }
}
