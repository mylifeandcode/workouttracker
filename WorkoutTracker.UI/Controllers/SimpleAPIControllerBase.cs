using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using WorkoutTracker.Domain.BaseClasses;
using WorkoutTracker.Application.Shared.Interfaces;

namespace WorkoutTracker.UI.Controllers
{
    public abstract class SimpleAPIControllerBase<T> : UserAwareController where T: Entity
    {
        protected ISimpleService<T> _service;

        public SimpleAPIControllerBase(ISimpleService<T> service)
        {
            _service = service ?? throw new ArgumentNullException(nameof(service));
        }

        [HttpGet]
        public virtual ActionResult<IEnumerable<T>> Get()
        {
            try
            {
                return Ok(_service.GetAll());
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpGet("{id}")]
        public virtual ActionResult<T> Get(int id)
        {
            try
            {
                var entity = _service.GetById(id);

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
        public virtual ActionResult<T> Post([FromBody] T value)
        {
            try
            {
                SetCreatedAuditFields(value);
                return Ok(_service.Add(value));
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
        public virtual ActionResult<T> Put(int id, [FromBody] T value)
        {
            try
            {
                SetModifiedAuditFields(value);
                return Ok(_service.Update(value));
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
        public virtual IActionResult Delete(int id)
        {
            try
            {
                _service.Delete(id);
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
    }
}
