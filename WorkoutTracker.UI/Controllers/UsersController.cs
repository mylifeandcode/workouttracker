using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using WorkoutApplication.Domain;
using WorkoutApplication.Repository;
using WorkoutTracker.Application.Users;

namespace WorkoutTracker.UI.Controllers
{
    [Produces("application/json")]
    [Route("api/Users")]
    [EnableCors("SiteCorsPolicy")]
    public class UsersController : Controller
    {
        private IUserService _svc;

        public UsersController(IUserService svc)
        {
            if (svc == null)
                throw new ArgumentNullException("svc");

            _svc = svc;
        }

        // GET api/Users
        [HttpGet]
        public IEnumerable<User> Get()
        {
            return _svc.GetAll();
        }

        [HttpGet("{id}")]
        public User Get(int id)
        {
            return _svc.GetById(id);
        }

        [HttpPost]
        public User Post([FromBody]User user)
        {
            return _svc.Add(user);
        }

        [HttpPut]
        public User Put([FromBody]User user)
        {
            return _svc.Update(user);
        }

        [HttpDelete("{id}")]
        public void Delete(int id)
        {
            _svc.Delete(id);
        }
    }
}