using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using WorkoutTracker.Application;

namespace WorkoutTracker.UI.Controllers
{
    public abstract class SimpleAPIControllerBase<T> : ControllerBase
    {
        protected ISimpleService<T> _service;

        public SimpleAPIControllerBase(ISimpleService<T> service)
        {
            _service = service ?? throw new ArgumentNullException(nameof(service));
        }

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

        public virtual ActionResult<T> Post([FromBody] T value)
        {
            try
            {
                return Ok(_service.Add(value));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        public virtual ActionResult<T> Put(int id, [FromBody] T value)
        {
            try
            {
                return Ok(_service.Update(value));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

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
