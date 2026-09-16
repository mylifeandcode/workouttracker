using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
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
            IWorkoutDTOMapper workoutDTOMapper,
            ILoggerFactory loggerFactory) : base(loggerFactory)
        {
            _workoutService = workoutService ?? throw new ArgumentNullException(nameof(workoutService));
            _workoutPlanService = workoutPlanService ?? throw new ArgumentNullException(nameof(workoutPlanService));
            _executedWorkoutService = executedWorkoutService ?? throw new ArgumentNullException(nameof(executedWorkoutService));
            _workoutDTOMapper = workoutDTOMapper ?? throw new ArgumentNullException(nameof(workoutDTOMapper));
        }

        // GET: api/Workouts
        [HttpGet]
        public async Task<ActionResult<PaginatedResults<WorkoutDTO>>> Get(int firstRecord, short pageSize, bool activeOnly, bool sortAscending = true, string nameContains = null, CancellationToken cancellationToken = default)
        {
            try
            {
                var userId = GetUserID();

                var filter = BuildWorkoutFilter(userId, activeOnly, nameContains);

                int totalCount = await _workoutService.GetTotalCountAsync(filter, cancellationToken);

                var workouts = (await _workoutService.GetAsync(firstRecord, pageSize, filter, sortAscending, cancellationToken));

                var results = workouts.Select((workout) =>
                {
                    return _workoutDTOMapper.MapFromWorkout(workout);
                });

                var result = new PaginatedResults<WorkoutDTO>(results, totalCount);
                return Ok(result);
            }
            catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting workouts.");
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
        public async Task<ActionResult<Workout>> GetByPublicId(Guid publicId, CancellationToken cancellationToken = default)
        {
            try
            {
                var workout = await _workoutService.GetByPublicIDAsync(publicId, cancellationToken);
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
            catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting workout {PublicId}.", publicId);
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
        public async Task<ActionResult<WorkoutPlan>> GetNewPlan(Guid workoutPublicId, CancellationToken cancellationToken = default)
        {
            try
            {
                var plan = await _workoutPlanService.CreateAsync(workoutPublicId, this.GetUserID(), cancellationToken);
                return Ok(plan);
            }
            catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating new plan for workout {WorkoutPublicId}.", workoutPublicId);
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPost("plan")]
        public async Task<ActionResult<Guid>> SubmitPlan([FromBody] WorkoutPlan plan, CancellationToken cancellationToken = default)
        {
            return await CreateWorkoutFromWorkoutPlanAsync(plan, true, cancellationToken);
        }

        [HttpPost("plan-for-later")]
        public async Task<ActionResult<Guid>> SubmitPlanForLater([FromBody] WorkoutPlan plan, CancellationToken cancellationToken = default)
        {
            return await CreateWorkoutFromWorkoutPlanAsync(plan, false, cancellationToken);
        }

        [HttpPost("plan-for-past/{startDateTime}/{endDateTime}")]
        public async Task<ActionResult<Guid>> SubmitPlanForPast([FromBody] WorkoutPlan plan, DateTime startDateTime, DateTime endDateTime, CancellationToken cancellationToken = default) {
            return await CreateWorkoutFromWorkoutPlanForPastAsync(plan, startDateTime, endDateTime, cancellationToken);
        }

        // POST api/Workouts
        [HttpPost]
        public async Task<ActionResult<Workout>> Post([FromBody]Workout value, CancellationToken cancellationToken = default)
        {
            try
            {
                SetCreatedAuditFields(value);
                return Ok(await _workoutService.AddAsync(value, true, cancellationToken));
            }
            catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating workout.");
                return StatusCode(500, ex.Message);
            }
        }

        // PUT api/Workouts
        [HttpPut]
        public async Task<ActionResult<Workout>> Put([FromBody]Workout value, CancellationToken cancellationToken = default)
        {
            try
            {
                SetModifiedAuditFields(value);
                return Ok(await _workoutService.UpdateAsync(value, true, cancellationToken));
            }
            catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating workout {PublicId}.", value?.PublicId);
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
        public async Task<ActionResult> Retire(Guid publicId, CancellationToken cancellationToken = default)
        {
            try
            {
                await _workoutService.RetireAsync(publicId, cancellationToken);
                return Ok();
            }
            catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retiring workout {PublicId}.", publicId);
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPut("{publicId}/reactivate")]
        public async Task<ActionResult> Reactivate(Guid publicId, CancellationToken cancellationToken = default)
        {
            try
            {
                await _workoutService.ReactivateAsync(publicId, cancellationToken);
                return Ok();
            }
            catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error reactivating workout {PublicId}.", publicId);
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

        private async Task<ActionResult<Guid>> CreateWorkoutFromWorkoutPlanAsync(WorkoutPlan plan, bool startWorkout, CancellationToken cancellationToken = default)
        {
            try
            {
                var executedWorkout = await _executedWorkoutService.CreateAsync(plan, startWorkout, cancellationToken);
                return Ok(executedWorkout.PublicId);
            }
            catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating workout from plan {WorkoutPublicId}.", plan?.WorkoutId);
                return StatusCode(500, ex.Message);
            }
        }

        private async Task<ActionResult<Guid>> CreateWorkoutFromWorkoutPlanForPastAsync(WorkoutPlan plan, DateTime startDateTime, DateTime endDateTime, CancellationToken cancellationToken = default)
        {
            try
            {
                var executedWorkout = await _executedWorkoutService.CreateAsync(plan, startDateTime, endDateTime, cancellationToken);
                return Ok(executedWorkout.PublicId);
            }
            catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating past workout from plan {WorkoutPublicId}.", plan?.WorkoutId);
                return StatusCode(500, ex.Message);
            }
        }
    }
}
