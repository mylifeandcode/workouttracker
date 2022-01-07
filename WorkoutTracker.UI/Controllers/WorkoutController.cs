﻿using System;
using System.Linq;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using WorkoutApplication.Application.Workouts;
using WorkoutApplication.Domain.Workouts;
using WorkoutTracker.Application.FilterClasses;
using WorkoutTracker.Application.Workouts;
using WorkoutTracker.UI.Models;

namespace WorkoutTracker.UI.Controllers
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

        public WorkoutController(
            IWorkoutService workoutService, 
            IWorkoutPlanService workoutPlanService, 
            IExecutedWorkoutService executedWorkoutService)
        {
            _workoutService = workoutService ?? throw new ArgumentNullException(nameof(workoutService));
            _workoutPlanService = workoutPlanService ?? throw new ArgumentNullException(nameof(workoutPlanService));
            _executedWorkoutService = executedWorkoutService ?? throw new ArgumentNullException(nameof(executedWorkoutService));
        }

        // GET: api/Workouts
        [HttpGet]
        public ActionResult<PaginatedResults<WorkoutDTO>> Get(int firstRecord, short pageSize, string nameContains = null)
        {
            try
            {
                //TODO: Consolidate this code somewhere!
                var userId = GetUserID();

                var filter = BuildWorkoutFilter(userId, nameContains);

                int totalCount = _workoutService.GetTotalCount(); //TODO: Modify to get total count by filter

                //Blows up after upgrading to EF Core 3.1 from 2.2!
                //More info at https://stackoverflow.com/questions/59677609/problem-with-ef-core-after-migrating-from-2-2-to-3-1
                //Had to add .ToList() to the call below.
                var workouts = _workoutService.Get(firstRecord, pageSize, filter).ToList();

                //TODO: Consolidate this and the other identical code further down in this class. Adapter class maybe?
                var results = workouts.Select((workout) =>
                {
                    return new WorkoutDTO(
                        workout.Id,
                        workout.Name,
                        workout.Exercises.Select(exercise => new ExerciseInWorkoutDTO(exercise)),
                        string.Join(", ",
                             workout.Exercises.SelectMany(x =>
                                x.Exercise.ExerciseTargetAreaLinks.Select(x => x.TargetArea.Name))
                            .OrderBy(x => x)
                            .Distinct()));
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

                //TODO: This code is duplicated. Consolidate, maybe in an adapter class.
                var dto = new WorkoutDTO(
                    workout.Id, 
                    workout.Name, 
                    workout.Exercises.Select(exercise => new ExerciseInWorkoutDTO(exercise)),
                    string.Join(", ",
                        workout.Exercises.SelectMany(x =>
                            x.Exercise.ExerciseTargetAreaLinks.Select(x => x.TargetArea.Name))
                        .OrderBy(x => x)
                        .Distinct()));

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
            try
            {
                var executedWorkout = _executedWorkoutService.Create(plan);
                return Ok(executedWorkout.Id);

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