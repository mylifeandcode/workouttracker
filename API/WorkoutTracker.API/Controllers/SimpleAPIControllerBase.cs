using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using WorkoutTracker.Domain.BaseClasses;
using WorkoutTracker.Application.Shared.Interfaces;

namespace WorkoutTracker.API.Controllers
{
    public abstract class SimpleAPIControllerBase<T> : UserAwareController where T: Entity
    {
        protected ISimpleService<T> _service;

        public SimpleAPIControllerBase(ISimpleService<T> service)
        {
            _service = service ?? throw new ArgumentNullException(nameof(service));
        }

        [HttpGet]
        public virtual async Task<ActionResult<IEnumerable<T>>> Get()
        {
            try
            {
                return Ok(await _service.GetAllAsync());
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpGet("{id:int}")]
        public virtual async Task<ActionResult<T>> Get(int id)
        {
            try
            {
                var entity = await _service.GetByIdAsync(id);

                if (entity == null)
                    return NotFound();
                else
                    return Ok(entity);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPost]
        public virtual async Task<ActionResult<T>> Post([FromBody] T value, bool setAuditFields = true)
        {
            try
            {
                if (setAuditFields) SetCreatedAuditFields(value);
                return Ok(await _service.AddAsync(value));
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
        public virtual async Task<ActionResult<T>> Put(int id, [FromBody] T value)
        {
            try
            {
                SetModifiedAuditFields(value);
                return Ok(await _service.UpdateAsync(value));
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

        [HttpDelete("{id}")]
        public virtual async Task<IActionResult> Delete(int id)
        {
            try
            {
                await _service.DeleteAsync(id);
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
    }
}
