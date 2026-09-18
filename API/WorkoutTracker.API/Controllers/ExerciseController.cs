using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using WorkoutTracker.Domain.Exercises;
using WorkoutTracker.Application.Exercises.Interfaces;
using WorkoutTracker.Application.Exercises.Models;
using WorkoutTracker.API.Models;
using WorkoutTracker.API.Mappers;

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
        private readonly IExerciseDTOMapper _exerciseDTOMapper;

        public ExerciseController(IExerciseService svc, IExerciseDTOMapper exerciseDTOMapper, ILoggerFactory loggerFactory) : base(loggerFactory)
        {
            if (svc == null)
                throw new ArgumentNullException("svc");

            _exerciseService = svc;
            _exerciseDTOMapper = exerciseDTOMapper ?? throw new ArgumentNullException(nameof(exerciseDTOMapper));
        }

        // GET: api/Exercises
        [HttpGet]
        public async Task<ActionResult<PaginatedResults<ExerciseDTO>>> Get(int firstRecord, short pageSize, string nameContains = null, string hasTargetAreas = null, bool sortAscending = true, CancellationToken cancellationToken = default)
        {
            try
            {
                var filter = BuildExerciseFilter(nameContains, hasTargetAreas);

                int totalCount = await _exerciseService.GetTotalCountAsync(filter, cancellationToken);

                var exercises = await _exerciseService.GetAsync(firstRecord, pageSize, filter, sortAscending, cancellationToken);

                var results = exercises.Select((exercise) =>
                {
                    return new ExerciseDTO(
                        exercise.Id,
                        exercise.PublicId,
                        exercise.CreatedDateTime,
                        exercise.ModifiedDateTime,
                        exercise.Name,
                        string.Join(", ", exercise.ExerciseTargetAreaLinks.Select(x => x.TargetArea.Name)));
                });

                var result = new PaginatedResults<ExerciseDTO>(results, totalCount);

                return Ok(result);
            }
            catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting exercises.");
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
        public async Task<ActionResult<ExerciseDetailDTO>> GetByPublicId(Guid publicId, CancellationToken cancellationToken = default)
        {
            try
            {
                var exercise = await _exerciseService.GetByPublicIdAsync(publicId, cancellationToken);
                if (exercise == null)
                    return NotFound(publicId);
                else
                    return Ok(_exerciseDTOMapper.MapToDetailDTO(exercise));
            }
            catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting exercise {PublicId}.", publicId);
                return StatusCode(500, ex.Message);
            }
        }

        // POST api/Exercises
        [HttpPost]
        public async Task<ActionResult<Exercise>> Post([FromBody]Exercise value, CancellationToken cancellationToken = default)
        {
            try
            {
                SetCreatedAuditFields(value);
                return Ok(await _exerciseService.AddAsync(value, true, cancellationToken));
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
                _logger.LogError(ex, "Error creating exercise.");
                return StatusCode(500, ex.Message);
            }
        }

        // PUT api/Exercises
        [HttpPut]
        public async Task<ActionResult<Exercise>> Put([FromBody]Exercise value, CancellationToken cancellationToken = default)
        {
            try
            {
                SetModifiedAuditFields(value);
                return Ok(await _exerciseService.UpdateAsync(value, true, cancellationToken));
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
                _logger.LogError(ex, "Error updating exercise {PublicId}.", value?.PublicId);
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
