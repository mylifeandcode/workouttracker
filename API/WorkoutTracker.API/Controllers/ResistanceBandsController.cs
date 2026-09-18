using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using WorkoutTracker.Domain.Resistances;
using WorkoutTracker.Application.Resistances.Interfaces;
using WorkoutTracker.API.Mappers;
using WorkoutTracker.API.Models;

namespace WorkoutTracker.API.Controllers
{
    [Produces("application/json")]
    [Route("api/ResistanceBands")]
    [EnableCors("SiteCorsPolicy")]
    [Authorize]
    [ApiController]
    public class ResistanceBandsController : SimpleAPIControllerBase<ResistanceBand>
    {
        private readonly IResistanceBandDTOMapper _resistanceBandDTOMapper;

        public ResistanceBandsController(IResistanceBandService service, IResistanceBandDTOMapper resistanceBandDTOMapper, ILoggerFactory loggerFactory) : base(service, loggerFactory)
        {
            _resistanceBandDTOMapper = resistanceBandDTOMapper ?? throw new ArgumentNullException(nameof(resistanceBandDTOMapper));
        }

        // These replace the base implementation because we don't want to return the raw
        // domain entity. Declared return types still say IEnumerable<ResistanceBand>/ResistanceBand
        // because they override SimpleAPIControllerBase<ResistanceBand>'s methods (return types
        // aren't covariant for an unrelated DTO type), but Ok() doesn't care what shape the boxed
        // value actually is — it's a ResistanceBandDTO underneath. Same technique as
        // UsersController.Get() — including the [ProducesResponseType] override below, which is
        // load-bearing: without it, the OpenAPI schema (and therefore the generated frontend
        // client) advertises the declared ResistanceBand type instead of the DTO actually
        // returned at runtime.
        [ProducesResponseType(typeof(IEnumerable<ResistanceBandDTO>), StatusCodes.Status200OK)]
        public override async Task<ActionResult<IEnumerable<ResistanceBand>>> Get(CancellationToken cancellationToken = default)
        {
            try
            {
                var resistanceBands = await _service.GetAllAsync(cancellationToken);
                return Ok(_resistanceBandDTOMapper.MapFromResistanceBands(resistanceBands));
            }
            catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all {EntityType} entities.", typeof(ResistanceBand).Name);
                return StatusCode(500, ex.Message);
            }
        }

        [ProducesResponseType(typeof(ResistanceBandDTO), StatusCodes.Status200OK)]
        public override async Task<ActionResult<ResistanceBand>> Get(int id, CancellationToken cancellationToken = default)
        {
            try
            {
                var entity = await _service.GetByIdAsync(id, cancellationToken);

                if (entity == null)
                    return NotFound();
                else
                    return Ok(_resistanceBandDTOMapper.MapFromResistanceBand(entity));
            }
            catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting {EntityType} {Id}.", typeof(ResistanceBand).Name, id);
                return StatusCode(500, ex.Message);
            }
        }
    }
}
