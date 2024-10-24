using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using WorkoutTracker.Domain.Exercises;
using WorkoutTracker.Application.Exercises.Interfaces;
using WorkoutTracker.Application.Exercises.Models;
using WorkoutTracker.API.Models;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace WorkoutTracker.API.Controllers
{
    [Produces("application/json")]
    [Route("api/Exercises")]
    [EnableCors("SiteCorsPolicy")]
    [Authorize]
    [ApiController]
    public class ExerciseController : UserAwareController
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

                int totalCount = _exerciseService.GetTotalCount(filter); //TODO: Modify to get total count by filter

                //Blows up after upgrading to EF Core 3.1 from 2.2!
                //More info at https://stackoverflow.com/questions/59677609/problem-with-ef-core-after-migrating-from-2-2-to-3-1
                //Had to add .ToList() to the call below.
                var exercises =
                    _exerciseService
                        .Get(firstRecord, pageSize, filter)
                        .OrderBy(x => x.Name);

                var results = exercises.Select((exercise) =>
                {
                    return new ExerciseDTO(
                        exercise.PublicId,
                        exercise.CreatedDateTime,
                        exercise.ModifiedDateTime,
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

        /*
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
        */

        [HttpGet("{publicId}")]
        public ActionResult<Exercise> GetByPublicId(Guid publicId)
        {
            try
            {
                var exercise = _exerciseService.GetByPublicId(publicId);
                if (exercise == null)
                    return NotFound(publicId);
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
                SetCreatedAuditFields(value);
                return Ok(_exerciseService.Add(value, true));
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

        // PUT api/Exercises
        [HttpPut]
        public ActionResult<Exercise> Put([FromBody]Exercise value)
        {
            try
            {
                SetModifiedAuditFields(value);
                return Ok(_exerciseService.Update(value, true));
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

        // DELETE api/Exercises/some-guid
        [HttpDelete("{publicId}")]
        public ActionResult Delete(Guid publicId)
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
