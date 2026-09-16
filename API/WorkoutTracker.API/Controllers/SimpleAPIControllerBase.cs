using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using WorkoutTracker.Domain.BaseClasses;
using WorkoutTracker.Application.Shared.Interfaces;

namespace WorkoutTracker.API.Controllers
{
    public abstract class SimpleAPIControllerBase<T> : UserAwareController where T: Entity
    {
        protected ISimpleService<T> _service;

        public SimpleAPIControllerBase(ISimpleService<T> service, ILoggerFactory loggerFactory) : base(loggerFactory)
        {
            _service = service ?? throw new ArgumentNullException(nameof(service));
        }

        [HttpGet]
        public virtual async Task<ActionResult<IEnumerable<T>>> Get(CancellationToken cancellationToken = default)
        {
            try
            {
                return Ok(await _service.GetAllAsync(cancellationToken));
            }
            catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all {EntityType} entities.", typeof(T).Name);
                return StatusCode(500, ex.Message);
            }
        }

        [HttpGet("{id:int}")]
        public virtual async Task<ActionResult<T>> Get(int id, CancellationToken cancellationToken = default)
        {
            try
            {
                var entity = await _service.GetByIdAsync(id, cancellationToken);

                if (entity == null)
                    return NotFound();
                else
                    return Ok(entity);
            }
            catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting {EntityType} {Id}.", typeof(T).Name, id);
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPost]
        public virtual async Task<ActionResult<T>> Post([FromBody] T value, bool setAuditFields = true, CancellationToken cancellationToken = default)
        {
            try
            {
                if (setAuditFields) SetCreatedAuditFields(value);
                return Ok(await _service.AddAsync(value, cancellationToken));
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
                _logger.LogError(ex, "Error creating {EntityType}.", typeof(T).Name);
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPut("{id}")]
        public virtual async Task<ActionResult<T>> Put(int id, [FromBody] T value, CancellationToken cancellationToken = default)
        {
            try
            {
                SetModifiedAuditFields(value);
                return Ok(await _service.UpdateAsync(value, cancellationToken));
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
                _logger.LogError(ex, "Error updating {EntityType} {Id}.", typeof(T).Name, id);
                return StatusCode(500, ex.Message);
            }
        }

        [HttpDelete("{id}")]
        public virtual async Task<IActionResult> Delete(int id, CancellationToken cancellationToken = default)
        {
            try
            {
                await _service.DeleteAsync(id, cancellationToken);
                return NoContent();
            }
            catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting {EntityType} {Id}.", typeof(T).Name, id);
                return StatusCode(500, ex.Message);
            }
        }
    }
}
