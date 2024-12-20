﻿using System;
using System.Linq;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
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
            IExecutedWorkoutSummaryDTOMapper summaryDtoMapper)
        {
            _executedWorkoutService = executedWorkoutService ?? throw new ArgumentNullException(nameof(executedWorkoutService));
            _dtoMapper = dtoMapper ?? throw new ArgumentNullException(nameof(dtoMapper));
            _summaryDtoMapper = summaryDtoMapper ?? throw new ArgumentNullException(nameof(summaryDtoMapper));
        }

        // GET api/ExecutedWorkout/5
        [HttpGet("{publicId}")]
        public ActionResult<ExecutedWorkoutDTO> Get(Guid publicId)
        {
            try
            {
                var executedWorkout = _executedWorkoutService.GetByPublicId(publicId);
                if (executedWorkout == null)
                    return NotFound();

                if (executedWorkout.CreatedByUserId != GetUserID())
                    return Forbid();

                return _dtoMapper.MapFromExecutedWorkout(executedWorkout);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        //THERE IS NOT POST FOR EXECUTEDWORKOUTDTO -- THESE ONLY GET CREATED SERVER-SIDE

        [HttpPut("{id}")]
        public ActionResult<ExecutedWorkoutDTO> Put([FromBody] ExecutedWorkoutDTO value)
        {
            try
            {
                //This attempt to prevent an intermittent problem caused BIGGER problems! Revisit!
                /*
                if(value.Exercises.Any(x => x.ExecutedWorkoutId == 0))
                    return StatusCode(400, "One or more ExecutedExercises has an ExecutedWorkoutId of 0.");

                if(value.Id == 0)
                    return StatusCode(400, "ExecutedWorkout has an Id of 0.");
                */
                var executedWorkout = _executedWorkoutService.GetByPublicId(value.Id);
                UpdateExecutedWorkoutFromDTO(executedWorkout, value);
                SetModifiedAuditFields(executedWorkout);
                var updatedWorkout = _executedWorkoutService.Update(executedWorkout, true);
                return _dtoMapper.MapFromExecutedWorkout(executedWorkout);
            }
            catch (BadHttpRequestException ex)
            {
                return BadRequest(ex);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpGet]
        public ActionResult<PaginatedResults<ExecutedWorkoutSummaryDTO>> Get(int firstRecord, short pageSize, DateTime? startDateTime = null, DateTime? endDateTime = null, bool newestFirst = true)
        {
            try
            {
                var userId = GetUserID();

                var filter =
                    BuildExecutedWorkoutFilter(
                        userId, startDateTime, endDateTime);

                int totalCount = _executedWorkoutService.GetTotalCount(filter);

                var executedWorkouts =
                    _executedWorkoutService
                        .GetFilteredSubset(firstRecord, pageSize, filter, newestFirst)
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
            catch (BadHttpRequestException ex)
            {
                return BadRequest(ex);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }


        [HttpGet("planned")]
        public ActionResult<PaginatedResults<ExecutedWorkoutSummaryDTO>> GetPlanned(int firstRecord, short pageSize, bool newestFirst = true)
        {
            try
            {
                var userId = GetUserID();

                var filter =
                    BuildExecutedWorkoutFilter(
                        userId, null, null, true); //last param of true is "planned only"

                int totalCount = _executedWorkoutService.GetTotalCount(filter);

                var executedWorkouts =
                    _executedWorkoutService
                        .GetFilteredSubset(firstRecord, pageSize, filter, newestFirst)
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
            catch (BadHttpRequestException ex)
            {
                return BadRequest(ex);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpGet("in-progress")]
        public ActionResult<ExecutedWorkoutSummaryDTO[]> GetInProgress()
        {
            try 
            {
                var inProgressWorkouts = _executedWorkoutService.GetInProgress(GetUserID()).ToList(); //Enumerate!
                if (!inProgressWorkouts.Any())
                    return Ok(new List<ExecutedWorkoutSummaryDTO>(0));

                var summary = inProgressWorkouts.Select(x => _summaryDtoMapper.MapFromExecutedWorkout(x)).ToArray();
                return Ok(summary);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpDelete("planned/{publicId}")]
        public ActionResult DeletePlanned(Guid publicId)
        {
            try
            { 
                _executedWorkoutService.DeletePlanned(publicId);
                return StatusCode(200);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        private ExecutedWorkoutFilter BuildExecutedWorkoutFilter(
            int userId, 
            DateTime? startDateTime, 
            DateTime? endDateTime,
            bool plannedOnly = false)
        {
            var filter = new ExecutedWorkoutFilter();

            filter.UserId = userId;
            filter.PlannedOnly = plannedOnly;

            if (!plannedOnly) //TODO: Rethink. This is kind of kludgey.
            { 
                if(filter.StartDateTime.HasValue)
                    filter.StartDateTime = startDateTime;
            
                if(filter.EndDateTime.HasValue)
                    filter.EndDateTime = endDateTime;
            }

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