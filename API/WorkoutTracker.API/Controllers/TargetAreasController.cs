using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using WorkoutTracker.Domain.Exercises;
using WorkoutTracker.Application.Exercises.Interfaces;
using WorkoutTracker.API.Mappers;
using WorkoutTracker.API.Models;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace WorkoutTracker.API.Controllers
{
    [Route("api/[controller]")]
    [EnableCors("SiteCorsPolicy")]
    [Authorize]
    public class TargetAreasController : UserAwareController
    {
        protected ITargetAreaService _svc;
        private readonly ITargetAreaDTOMapper _targetAreaDTOMapper;

        public TargetAreasController(ITargetAreaService svc, ITargetAreaDTOMapper targetAreaDTOMapper, ILoggerFactory loggerFactory) : base(loggerFactory)
        {
            _svc = svc ?? throw new ArgumentNullException("svc");
            _targetAreaDTOMapper = targetAreaDTOMapper ?? throw new ArgumentNullException(nameof(targetAreaDTOMapper));
        }

        // GET: api/values
        [HttpGet]
        public async Task<ActionResult<IEnumerable<TargetAreaDTO>>> Get(CancellationToken cancellationToken = default)
        {
            try
            {
                var targetAreas = await _svc.GetAllAsync(cancellationToken);
                return Ok(_targetAreaDTOMapper.MapFromTargetAreas(targetAreas));
            }
            catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all target areas.");
                return StatusCode(500, ex.Message);
            }
        }

        // GET api/values/5
        [HttpGet("{id}")]
        public async Task<ActionResult<TargetAreaDTO>> Get(int id, CancellationToken cancellationToken = default)
        {
            try
            {
                var targetArea = await _svc.GetAsync(id, cancellationToken);
                if (targetArea == null)
                    return NotFound(id);
                else
                    return Ok(_targetAreaDTOMapper.MapFromTargetArea(targetArea));
            }
            catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting target area {Id}.", id);
                return StatusCode(500, ex.Message);
            }
        }

        // POST api/values
        [HttpPost]
        public ActionResult<TargetArea> Post([FromBody]TargetArea value)
        {
            throw new NotImplementedException();
        }

        // PUT api/values/5
        [HttpPut("{id}")]
        public ActionResult<TargetArea> Put(int id, [FromBody]TargetArea value)
        {
            throw new NotImplementedException();
        }

        // DELETE api/values/5
        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            throw new NotImplementedException();
        }
    }
}
