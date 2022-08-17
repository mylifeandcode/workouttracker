using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using WorkoutTracker.Domain.Users;
using WorkoutTracker.Application.Users.Interfaces;
using WorkoutTracker.UI.Models;
using WorkoutTracker.Application.Workouts.Interfaces;
using WorkoutTracker.UI.Auth;

namespace WorkoutTracker.UI.Controllers
{
    [Produces("application/json")]
    [Route("api/Users")]
    [EnableCors("SiteCorsPolicy")]
    [Authorize]
    [ApiController]
    public class UsersController : SimpleAPIControllerBase<User>
    {
        private readonly IExecutedWorkoutService _executedWorkoutService;
        private readonly ICryptoService _cryptoService;

        public UsersController(
            IUserService userService, 
            IExecutedWorkoutService executedWorkoutService, 
            ICryptoService cryptoService) : base(userService)
        {
            _executedWorkoutService = executedWorkoutService ?? throw new ArgumentNullException(nameof(executedWorkoutService));
            _cryptoService = cryptoService ?? throw new ArgumentNullException(nameof(cryptoService));
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
                    entity.HashedPassword = null; //TODO: Check if we need this. We already have an attribute in the class to not serialize this field.
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
            return base.Get(); //TODO: Remember why I overrode this rather than just deferring to the base class!
        }

        [Authorize(Roles = "Administrator")]
        public override ActionResult<User> Post([FromBody] User value)
        {
            throw new NotImplementedException();
            //return base.Post(value); //TODO: Remember why I overrode this rather than just deferring to the base class!
        }

        [Authorize(Roles = "Administrator")]
        [HttpPost("new")]
        public ActionResult<User> Post([FromBody] UserNewDTO value)
        {
            var user = GetUserFromUserNewDTO(value);
            return base.Post(user);
        }

        [HttpGet("overview")]
        public ActionResult<UserOverview> GetUserOverview()
        {
            var overview = new UserOverview();
            var user = _service.GetById(GetUserID());

            if (user == null)
                return StatusCode(500, "User not found.");
            
            overview.Username = user.Name;

            var mostRecentWorkout = _executedWorkoutService.GetRecent(1);
            if (mostRecentWorkout.Any())
                overview.LastWorkoutDateTime = mostRecentWorkout.First().StartDateTime;
            
            overview.PlannedWorkoutCount = _executedWorkoutService.GetPlannedCount(GetUserID());

            return Ok(overview);
        }

        private User GetUserFromUserNewDTO(UserNewDTO userNew)
        {
            var user = new User();
            SetCreatedAuditFields(user);
            user.Name = userNew.UserName;
            user.Role = userNew.Role;
            user.Salt = _cryptoService.GenerateSalt();
            user.HashedPassword = _cryptoService.ComputeHash(userNew.Password, user.Salt);
            return user;
        }
    }
}