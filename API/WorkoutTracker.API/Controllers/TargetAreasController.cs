using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using WorkoutTracker.Domain.Exercises;
using WorkoutTracker.Application.Exercises.Interfaces;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace WorkoutTracker.API.Controllers
{
    [Route("api/[controller]")]
    [EnableCors("SiteCorsPolicy")]
    [Authorize]
    public class TargetAreasController : UserAwareController
    {
        protected ITargetAreaService _svc;

        public TargetAreasController(ITargetAreaService svc)
        {
            _svc = svc ?? throw new ArgumentNullException("svc");
        }

        // GET: api/values
        [HttpGet]
        public async Task<ActionResult<IEnumerable<TargetArea>>> Get(CancellationToken cancellationToken = default)
        {
            try
            {
                return Ok(await _svc.GetAllAsync(cancellationToken));
            }
            catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
            {
                throw;
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        // GET api/values/5
        [HttpGet("{id}")]
        public async Task<ActionResult<TargetArea>> Get(int id, CancellationToken cancellationToken = default)
        {
            try
            {
                return Ok(await _svc.GetAsync(id, cancellationToken));
            }
            catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
            {
                throw;
            }
            catch (Exception ex)
            {
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
