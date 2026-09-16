using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using WorkoutTracker.Application.Workouts.Models;
using WorkoutTracker.Domain.Workouts;
using WorkoutTracker.Application.Workouts.Interfaces;
using WorkoutTracker.API.Models;
using WorkoutTracker.API.Mappers;
using System.Collections.Generic;

namespace WorkoutTracker.API.Controllers
{
    [Produces("application/json")]
    [Route("api/[controller]")]
    [EnableCors("SiteCorsPolicy")]
    [Authorize]
    [ApiController]
    public class ExecutedWorkoutController : UserAwareController
    {
        private IExecutedWorkoutService _executedWorkoutService;
        private IExecutedWorkoutDTOMapper _dtoMapper;
        private IExecutedWorkoutSummaryDTOMapper _summaryDtoMapper;

        public ExecutedWorkoutController(
            IExecutedWorkoutService executedWorkoutService,
            IExecutedWorkoutDTOMapper dtoMapper,
            IExecutedWorkoutSummaryDTOMapper summaryDtoMapper,
            ILoggerFactory loggerFactory) : base(loggerFactory)
        {
            _executedWorkoutService = executedWorkoutService ?? throw new ArgumentNullException(nameof(executedWorkoutService));
            _dtoMapper = dtoMapper ?? throw new ArgumentNullException(nameof(dtoMapper));
            _summaryDtoMapper = summaryDtoMapper ?? throw new ArgumentNullException(nameof(summaryDtoMapper));
        }

        // GET api/ExecutedWorkout/5
        [HttpGet("{publicId}")]
        public async Task<ActionResult<ExecutedWorkoutDTO>> Get(Guid publicId, CancellationToken cancellationToken = default)
        {
            try
            {
                var executedWorkout = await _executedWorkoutService.GetByPublicIDAsync(publicId, cancellationToken);
                if (executedWorkout == null)
                    return NotFound();

                if (executedWorkout.CreatedByUserId != GetUserID())
                    return Forbid();

                return _dtoMapper.MapFromExecutedWorkout(executedWorkout);
            }
            catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting executed workout {PublicId}.", publicId);
                return StatusCode(500, ex.Message);
            }
        }

        //THERE IS NO POST FOR EXECUTEDWORKOUTDTO -- THESE ONLY GET CREATED SERVER-SIDE

        [HttpPut("{id}")]
        public async Task<ActionResult<ExecutedWorkoutDTO>> Put([FromBody] ExecutedWorkoutDTO value, CancellationToken cancellationToken = default)
        {
            try
            {
                var executedWorkout = await _executedWorkoutService.GetByPublicIDAsync(value.Id, cancellationToken);
                UpdateExecutedWorkoutFromDTO(executedWorkout, value);
                SetModifiedAuditFields(executedWorkout);
                await _executedWorkoutService.UpdateAsync(executedWorkout, true, cancellationToken);
                return _dtoMapper.MapFromExecutedWorkout(executedWorkout);
            }
            catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
            {
                throw;
            }
            catch (BadHttpRequestException ex)
            {
                return BadRequest(ex);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating executed workout {PublicId}.", value?.Id);
                return StatusCode(500, ex.Message);
            }
        }

        [HttpGet]
        public async Task<ActionResult<PaginatedResults<ExecutedWorkoutSummaryDTO>>> Get(
            int firstRecord,
            short pageSize,
            DateTime? startDateTime = null,
            DateTime? endDateTime = null,
            bool newestFirst = true,
            string workoutNameContains = null,
            bool onlyWithJournalNotes = false,
            CancellationToken cancellationToken = default)
        {
            try
            {
                var userId = GetUserID();

                var filter =
                    BuildExecutedWorkoutFilter(
                        userId, startDateTime, endDateTime, false, workoutNameContains, onlyWithJournalNotes);

                int totalCount = await _executedWorkoutService.GetTotalCountAsync(filter, cancellationToken);

                var executedWorkouts =
                    (await _executedWorkoutService
                        .GetFilteredSubsetAsync(firstRecord, pageSize, filter, newestFirst, cancellationToken))
                        .ToList();

                var results = executedWorkouts.Select((executedWorkout) =>
                {
                    return new ExecutedWorkoutSummaryDTO(
                        executedWorkout.PublicId,
                        executedWorkout.CreatedDateTime,
                        executedWorkout.ModifiedDateTime,
                        executedWorkout.Workout.Name,
                        executedWorkout.Workout.PublicId,
                        executedWorkout.StartDateTime,
                        executedWorkout.EndDateTime,
                        executedWorkout.Journal);
                });

                var result = new PaginatedResults<ExecutedWorkoutSummaryDTO>(results, totalCount);

                return Ok(result);
            }
            catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
            {
                throw;
            }
            catch (BadHttpRequestException ex)
            {
                return BadRequest(ex);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting executed workouts.");
                return StatusCode(500, ex.Message);
            }
        }


        [HttpGet("planned")]
        public async Task<ActionResult<PaginatedResults<ExecutedWorkoutSummaryDTO>>> GetPlanned(int firstRecord, short pageSize, bool newestFirst = true, CancellationToken cancellationToken = default)
        {
            try
            {
                var userId = GetUserID();

                var filter =
                    BuildExecutedWorkoutFilter(
                        userId, null, null, true); //last param of true is "planned only"

                int totalCount = await _executedWorkoutService.GetTotalCountAsync(filter, cancellationToken);

                var executedWorkouts =
                    (await _executedWorkoutService
                        .GetFilteredSubsetAsync(firstRecord, pageSize, filter, newestFirst, cancellationToken))
                        .ToList();

                var results = executedWorkouts.Select((executedWorkout) =>
                {
                    return new ExecutedWorkoutSummaryDTO(
                        executedWorkout.PublicId,
                        executedWorkout.CreatedDateTime,
                        executedWorkout.ModifiedDateTime,
                        executedWorkout.Workout.Name,
                        executedWorkout.Workout.PublicId,
                        executedWorkout.StartDateTime,
                        executedWorkout.EndDateTime,
                        executedWorkout.Journal);
                });

                var result = new PaginatedResults<ExecutedWorkoutSummaryDTO>(results, totalCount);

                return Ok(result);
            }
            catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
            {
                throw;
            }
            catch (BadHttpRequestException ex)
            {
                return BadRequest(ex);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting planned workouts.");
                return StatusCode(500, ex.Message);
            }
        }

        [HttpGet("in-progress")]
        public async Task<ActionResult<ExecutedWorkoutSummaryDTO[]>> GetInProgress(CancellationToken cancellationToken = default)
        {
            try
            {
                var inProgressWorkouts = (await _executedWorkoutService.GetInProgressAsync(GetUserID(), cancellationToken)).ToList();
                if (!inProgressWorkouts.Any())
                    return Ok(new List<ExecutedWorkoutSummaryDTO>(0));

                var summary = inProgressWorkouts.Select(x => _summaryDtoMapper.MapFromExecutedWorkout(x)).ToArray();
                return Ok(summary);
            }
            catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting in-progress workouts.");
                return StatusCode(500, ex.Message);
            }
        }

        [HttpDelete("planned/{publicId}")]
        public async Task<ActionResult> DeletePlanned(Guid publicId, CancellationToken cancellationToken = default)
        {
            try
            {
                await _executedWorkoutService.DeletePlannedAsync(publicId, cancellationToken);
                return StatusCode(200);
            }
            catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting planned workout {PublicId}.", publicId);
                return StatusCode(500, ex.Message);
            }
        }

        private ExecutedWorkoutFilter BuildExecutedWorkoutFilter(
            int userId,
            DateTime? startDateTime,
            DateTime? endDateTime,
            bool plannedOnly = false,
            string workoutNameContains = null,
            bool onlyWithJournalNotes = false)
        {
            var filter = new ExecutedWorkoutFilter();

            filter.UserId = userId;
            filter.PlannedOnly = plannedOnly;
            filter.WorkoutNameContains = workoutNameContains;

            if (!plannedOnly) //TODO: Rethink. This is kind of kludgey.
            {
                if(filter.StartDateTime.HasValue)
                    filter.StartDateTime = startDateTime;

                if(filter.EndDateTime.HasValue)
                    filter.EndDateTime = endDateTime;
            }

            filter.OnlyWithJournalNotes = onlyWithJournalNotes;

            return filter;
        }

        private void UpdateExecutedWorkoutFromDTO(ExecutedWorkout executedWorkout, ExecutedWorkoutDTO dto)
        {
            executedWorkout.StartDateTime = dto.StartDateTime;
            executedWorkout.EndDateTime = dto.EndDateTime;
            executedWorkout.Journal = dto.Journal;

            foreach (var exerciseDTO in dto.Exercises)
            {
                var exercise = executedWorkout.Exercises.First(x => x.Sequence == exerciseDTO.Sequence);
                exercise.ActualRepCount = exerciseDTO.ActualRepCount;
                exercise.Duration = exerciseDTO.Duration;
                exercise.FormRating = exerciseDTO.FormRating;
                exercise.Notes = exerciseDTO.Notes;
                exercise.RangeOfMotionRating = exerciseDTO.RangeOfMotionRating;
                exercise.ResistanceAmount = exerciseDTO.ResistanceAmount;
                exercise.ResistanceMakeup = exerciseDTO.ResistanceMakeup;
                exercise.TargetRepCount = exerciseDTO.TargetRepCount;
            }
        }
    }
}
