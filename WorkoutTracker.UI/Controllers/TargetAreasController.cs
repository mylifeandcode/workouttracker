using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using WorkoutApplication.Domain.Exercises;
using WorkoutTracker.Application;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace WorkoutTracker.UI.Controllers
{
    [Route("api/[controller]")]
    public class TargetAreasController : Controller
    {
        protected ITargetAreasService _svc;

        public TargetAreasController(ITargetAreasService svc)
        {
            _svc = svc ?? throw new ArgumentNullException("svc");
        }

        // GET: api/values
        [HttpGet]
        public IEnumerable<TargetArea> Get()
        {
            return _svc.GetAll();
        }

        // GET api/values/5
        [HttpGet("{id}")]
        public TargetArea Get(int id)
        {
            return _svc.Get(id);
        }

        // POST api/values
        [HttpPost]
        public void Post([FromBody]TargetArea value)
        {
        }

        // PUT api/values/5
        [HttpPut("{id}")]
        public void Put(int id, [FromBody]TargetArea value)
        {
        }

        // DELETE api/values/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
        }
    }
}
