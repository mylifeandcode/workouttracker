using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using WorkoutApplication.Domain.Exercises;
using WorkoutTracker.Application.Exercises;
using WorkoutTracker.Application.FilterClasses;
using WorkoutTracker.UI.Models;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace WorkoutTracker.UI.Controllers
{
    [Produces("application/json")]
    [Route("api/Exercises")]
    [EnableCors("SiteCorsPolicy")]
    [ApiController]
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
        public ActionResult<PaginatedResults<ExerciseDTO>> Get(int firstRecord, short pageSize, string nameContains = null, string hasTargetAreas = null)
        {
            var filter = BuildExerciseFilter(nameContains, hasTargetAreas);
            var result = new PaginatedResults<ExerciseDTO>();
            result.TotalCount = _svc.GetTotalCount();
            var exercises = _svc.Get(firstRecord, pageSize, filter);
            result.Results = exercises.Select((exercise) => 
            {
                var dto = new ExerciseDTO();
                dto.Id = exercise.Id;
                dto.Name = exercise.Name;
                dto.TargetAreas =
                    string.Join(", ", exercise.ExerciseTargetAreaLinks.Select(x => x.TargetArea.Name));
                return dto;
            });
            return Ok(result);
        }

        // GET api/Exercises/5
        [HttpGet("{id}")]
        public ActionResult<Exercise> Get(int id)
        {
            var exercise = _svc.GetById(id);
            if (exercise == null)
                return NotFound(id);
            else
                return Ok(exercise);
        }

        // POST api/Exercises
        [HttpPost]
        public ActionResult<Exercise> Post([FromBody]Exercise value)
        {
            return Ok(_svc.Add(value, true));
        }

        // PUT api/Exercises/5
        [HttpPut("{id}")]
        public ActionResult<Exercise> Put(int id, [FromBody]Exercise value)
        {
            return Ok(_svc.Update(value, true));
        }

        // DELETE api/Exercises/5
        [HttpDelete("{id}")]
        public ActionResult Delete(int id)
        {
            throw new NotImplementedException();
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
