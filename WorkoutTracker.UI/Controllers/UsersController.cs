using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using WorkoutApplication.Domain;
using WorkoutTracker.Application.Users;

namespace WorkoutTracker.UI.Controllers
{
    [Produces("application/json")]
    [Route("api/Users")]
    [EnableCors("SiteCorsPolicy")]
    [ApiController]
    public class UsersController : SimpleAPIControllerBase<User>
    {
        public UsersController(IUserService service) : base(service)
        {
        }

        [HttpGet]
        public override ActionResult<IEnumerable<User>> Get()
        {
            return base.Get();
        }

        [HttpGet("{id}")]
        public override ActionResult<User> Get(int id)
        {
            return base.Get(id);
        }

        [HttpPost]
        public override ActionResult<User> Post([FromBody] User value)
        {
            return base.Post(value);
        }

        [HttpPut("{id}")]
        public override ActionResult<User> Put(int id, [FromBody] User value)
        {
            return base.Put(id, value);
        }

        [HttpDelete("{id}")]
        public override IActionResult Delete(int id)
        {
            return base.Delete(id);
        }
    }
}