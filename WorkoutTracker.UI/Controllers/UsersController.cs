using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using WorkoutApplication.Domain.Users;
using WorkoutTracker.Application.Users;

namespace WorkoutTracker.UI.Controllers
{
    [Produces("application/json")]
    [Route("api/Users")]
    [EnableCors("SiteCorsPolicy")]
    [Authorize]
    [ApiController]
    public class UsersController : SimpleAPIControllerBase<User>
    {
        public UsersController(IUserService service) : base(service)
        {
        }

        //TODO: Revisit. The below was causing a 500 response.
        /*
        [HttpGet("{id}")]
        public new ActionResult<UserDTO> Get(int id)
        {
            //This method replaces the default implementation because we don't 
            //want to return the domain object which includes the user's 
            //hashed password.
            //TODO: Implement a different authentication approach.
            //Is an STS overkill for this little home workout tracker?
            try
            {
                var entity = _service.GetById(id);

                if (entity == null)
                    return NotFound();
                else
                    return Ok(new UserDTO(entity));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
        */

        [HttpGet("{id}")]
        public override ActionResult<User> Get(int id)
        {
            //This method replaces the default implementation because we don't 
            //want to return the domain object which includes the user's 
            //hashed password.
            try
            {
                var entity = _service.GetById(id);

                if (entity == null)
                    return NotFound();
                else
                {
                    entity.HashedPassword = null;
                    return Ok(entity);
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [AllowAnonymous]
        public override ActionResult<IEnumerable<User>> Get()
        {
            return base.Get();
        }

        [Authorize(Roles = "Administrator")]
        public override ActionResult<User> Post([FromBody] User value)
        {
            return base.Post(value);
        }
    }
}