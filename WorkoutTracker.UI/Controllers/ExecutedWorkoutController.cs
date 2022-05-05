﻿using System;
using System.Linq;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using WorkoutTracker.Application.Workouts.Models;
using WorkoutTracker.Domain.Workouts;
using WorkoutTracker.Application.Workouts.Interfaces;
using WorkoutTracker.UI.Models;

namespace WorkoutTracker.UI.Controllers
{
    [Produces("application/json")]
    [Route("api/[controller]")]
    [EnableCors("SiteCorsPolicy")]
    [Authorize]
    [ApiController]
    public class ExecutedWorkoutController : UserAwareController
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

        [HttpGet]
        public ActionResult<PaginatedResults<ExecutedWorkoutDTO>> Get(int firstRecord, short pageSize, DateTime? startDateTime = null, DateTime? endDateTime = null, bool newestFirst = true)
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
                    return new ExecutedWorkoutDTO(
                        executedWorkout.Id,
                        executedWorkout.Workout.Name,
                        executedWorkout.WorkoutId,
                        executedWorkout.StartDateTime,
                        executedWorkout.EndDateTime, 
                        executedWorkout.CreatedDateTime, 
                        executedWorkout.Journal);
                });

                var result = new PaginatedResults<ExecutedWorkoutDTO>(results, totalCount);

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
        public ActionResult<PaginatedResults<ExecutedWorkoutDTO>> GetPlanned(int firstRecord, short pageSize, bool newestFirst = true)
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
                    return new ExecutedWorkoutDTO(
                        executedWorkout.Id,
                        executedWorkout.Workout.Name,
                        executedWorkout.WorkoutId,
                        executedWorkout.StartDateTime,
                        executedWorkout.EndDateTime, 
                        executedWorkout.CreatedDateTime, 
                        executedWorkout.Journal);
                });

                var result = new PaginatedResults<ExecutedWorkoutDTO>(results, totalCount);

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

        // POST api/ExecutedWorkout
        [HttpPost]
        public ActionResult<ExecutedWorkout> Post([FromBody] ExecutedWorkout value)
        {
            try
            {
                SetCreatedAuditFields(value);
                return _executedWorkoutService.Add(value, true);
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

        [HttpPut("{id}")]
        public ActionResult<ExecutedWorkout> Put([FromBody] ExecutedWorkout value)
        {
            try
            {
                SetModifiedAuditFields(value);
                return _executedWorkoutService.Update(value, true);
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
    }
}