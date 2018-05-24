using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using WorkoutApplication.Domain.Exercises;
using WorkoutTracker.Application.Exercises;
using WorkoutTracker.Application.FilterClasses;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace WorkoutTracker.UI.Controllers
{
    [Produces("application/json")]
    [Route("api/Exercises")]
    [EnableCors("SiteCorsPolicy")]
    public class ExerciseController : Controller
    {
        private IExerciseService _svc;

        public ExerciseController(IExerciseService svc)
        {
            if (svc == null)
                throw new ArgumentNullException("svc");

            _svc = svc;
        }

        // GET: api/Exercises
        [HttpGet]
        public IEnumerable<Exercise> Get(short startPage, short pageSize, string nameContains = null, string hasTargetAreas = null)
        {
            var filter = BuildExerciseFilter(nameContains, hasTargetAreas);
            return _svc.Get(startPage, pageSize, filter);
        }

        // GET api/Exercises/5
        [HttpGet("{id}")]
        public Exercise Get(int id)
        {
            return _svc.GetById(id);
        }

        // POST api/Exercises
        [HttpPost]
        public Exercise Post([FromBody]Exercise value)
        {
            return _svc.Add(value, true);
        }

        // PUT api/Exercises/5
        [HttpPut("{id}")]
        public void Put(int id, [FromBody]Exercise value)
        {
            throw new NotImplementedException();
        }

        // DELETE api/Exercises/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
        }

        private ExerciseFilter BuildExerciseFilter(string nameContains, string hasTargetAreas)
        {
            var filter = new ExerciseFilter();

            if (!String.IsNullOrWhiteSpace(nameContains))
                filter.NameContains = nameContains;

            if (!String.IsNullOrWhiteSpace(hasTargetAreas))
                filter.HasTargetAreas = hasTargetAreas.Split(',').ToList();

            return filter;
        }
    }
}
