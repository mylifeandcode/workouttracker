using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using WorkoutTracker.Application.BaseClasses;
using Microsoft.AspNetCore.Mvc;
using WorkoutTracker.Application;

namespace WorkoutTracker.UI.Controllers
{
    public class SimpleAPIControllerBase<T> : ControllerBase
    {
        protected ISimpleService<T> _service;

        public SimpleAPIControllerBase(ISimpleService<T> service)
        {
            _service = service ?? throw new ArgumentNullException(nameof(service));
        }

        [HttpGet]
        public ActionResult<IEnumerable<T>> Get()
        {
            return Ok(_service.GetAll());
        }

        [HttpGet("{id}", Name = "Get")]
        public ActionResult<T> Get(int id)
        {
            var entity = _service.GetById(id);

            if (entity == null)
                return NotFound();
            else
                return Ok(entity);
        }

        [HttpPost]
        public ActionResult<T> Post([FromBody] T value)
        {
            return Ok(_service.Add(value));
        }

        [HttpPut("{id}")]
        public ActionResult<T> Put(int id, [FromBody] T value)
        {
            return Ok(_service.Update(value));
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
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
