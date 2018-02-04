using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using WorkoutApplication.Domain;
using WorkoutApplication.Repository;

namespace WorkoutTracker.UI.Controllers
{
    [Produces("application/json")]
    [Route("api/Users")]
    [EnableCors("SiteCorsPolicy")]
    public class UsersController : Controller
    {
        private IRepository<User> _repo;

        public UsersController(IRepository<User> repo)
        {
            if (repo == null)
                throw new ArgumentNullException("repo");

            _repo = repo;
        }

        // GET api/values
        [HttpGet]
        public IEnumerable<User> Get()
        {
            return _repo.Get().Where(x => x.Name.ToUpper() != "SYSTEM");
        }

        [HttpGet("{id}")]
        public User Get(int id)
        {
            return _repo.Get().FirstOrDefault(x => x.Id == id);
        }

        [HttpPost]
        public User Post(User user)
        {
            return _repo.Add(user, true);
        }
    }
}