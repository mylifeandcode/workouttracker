using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using WorkoutApplication.Domain.Exercises;
using WorkoutTracker.Application.Exercises;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace WorkoutTracker.UI.Controllers
{
    [Route("api/[controller]")]
    public class ExerciseController : Controller
    {
        private IExerciseService _svc;

        public ExerciseController(IExerciseService svc)
        {
            if (svc == null)
                throw new ArgumentNullException("svc");

            _svc = svc;
        }

        // GET: api/values
        [HttpGet]
        public IEnumerable<Exercise> Get()
        {
            //TODO: Add paging params
            return _svc.GetAll(); 
        }

        // GET api/values/5
        [HttpGet("{id}")]
        public Exercise Get(int id)
        {
            return _svc.GetById(id);
        }

        // POST api/values
        [HttpPost]
        public void Post([FromBody]Exercise value)
        {
            
        }

        // PUT api/values/5
        [HttpPut("{id}")]
        public void Put(int id, [FromBody]Exercise value)
        {
        }

        // DELETE api/values/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
        }
    }
}
