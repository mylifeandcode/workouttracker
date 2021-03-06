﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using WorkoutApplication.Domain.Exercises;
using WorkoutTracker.Application.Exercises;
using WorkoutTracker.Application.FilterClasses;
using WorkoutTracker.UI.Models;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace WorkoutTracker.UI.Controllers
{
    [Produces("application/json")]
    [Route("api/Exercises")]
    [EnableCors("SiteCorsPolicy")]
    [ApiController]
    public class ExerciseController : Controller
    {
        private IExerciseService _exerciseService;

        public ExerciseController(IExerciseService svc)
        {
            if (svc == null)
                throw new ArgumentNullException("svc");

            _exerciseService = svc;
        }

        // GET: api/Exercises
        [HttpGet]
        public ActionResult<PaginatedResults<ExerciseDTO>> Get(int firstRecord, short pageSize, string nameContains = null, string hasTargetAreas = null)
        {
            try
            {
                var filter = BuildExerciseFilter(nameContains, hasTargetAreas);

                int totalCount = _exerciseService.GetTotalCount(); //TODO: Modify to get total count by filter

                //Blows up after upgrading to EF Core 3.1 from 2.2!
                //More info at https://stackoverflow.com/questions/59677609/problem-with-ef-core-after-migrating-from-2-2-to-3-1
                //Had to add .ToList() to the call below.
                var exercises = _exerciseService.Get(firstRecord, pageSize, filter).ToList();

                var results = exercises.Select((exercise) =>
                {
                    return new ExerciseDTO(
                        exercise.Id, 
                        exercise.Name, 
                        string.Join(", ", exercise.ExerciseTargetAreaLinks.Select(x => x.TargetArea.Name)));
                });

                var result = new PaginatedResults<ExerciseDTO>(results, totalCount);

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        // GET api/Exercises/5
        [HttpGet("{id}")]
        public ActionResult<Exercise> Get(int id)
        {
            try
            {
                var exercise = _exerciseService.GetById(id);
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

        // POST api/Exercises
        [HttpPost]
        public ActionResult<Exercise> Post([FromBody]Exercise value)
        {
            try
            {
                return Ok(_exerciseService.Add(value, true));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        // PUT api/Exercises/5
        [HttpPut("{id}")]
        public ActionResult<Exercise> Put(int id, [FromBody]Exercise value)
        {
            try
            {
                return Ok(_exerciseService.Update(value, true));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        // DELETE api/Exercises/5
        [HttpDelete("{id}")]
        public ActionResult Delete(int id)
        {
            throw new NotImplementedException();
        }

        // GET api/Exercises/ResistanceTypes
        [HttpGet("ResistanceTypes")]
        public ActionResult<Dictionary<int, string>> GetResistanceTypes()
        {
            return _exerciseService.GetResistanceTypes();
        }

        private ExerciseFilter BuildExerciseFilter(string nameContains, string hasTargetAreas)
        {
            var filter = new ExerciseFilter();

            if (!String.IsNullOrWhiteSpace(nameContains))
                filter.NameContains = nameContains;

            if (!String.IsNullOrWhiteSpace(hasTargetAreas))
                filter.HasTargetAreas = hasTargetAreas.Split(',').ToList();

            return filter;
        }
    }
}
