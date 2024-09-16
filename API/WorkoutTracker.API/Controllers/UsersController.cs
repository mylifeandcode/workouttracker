using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using WorkoutTracker.Domain.Users;
using WorkoutTracker.Application.Users.Interfaces;
using WorkoutTracker.API.Models;
using WorkoutTracker.Application.Workouts.Interfaces;
using WorkoutTracker.Application.Security.Interfaces;

namespace WorkoutTracker.API.Controllers
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

        [HttpGet("{publicId}")]
        public ActionResult<User> GetByPublicId(Guid publicId)
        {
            //This method replaces the default implementation because we don't 
            //want to return the domain object which includes the user's 
            //hashed password.
            try
            {
                var entity = _service.GetByPublicId(publicId);

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
            return Ok(_service.GetAllWithoutTracking());
        }

        [Authorize(Roles = "Administrator")]
        public override ActionResult<User> Post([FromBody] User value, bool setAuditFields = true)
        {
            int userId = this.GetUserID();
            value.Settings.ModifiedByUserId = userId;
            value.Settings.ModifiedDateTime = DateTime.Now;
            foreach (var repSetting in value.Settings.RepSettings)
            {
                repSetting.ModifiedByUserId = userId;
                repSetting.ModifiedDateTime = value.Settings.ModifiedDateTime = DateTime.Now;
            }
            return base.Post(value, setAuditFields);
        }

        //[Authorize(Roles = "Administrator")] NOPE -- Because anyone can create/register a new user
        [HttpPost("new")]
        [AllowAnonymous]
        public ActionResult<User> Post([FromBody] UserNewDTO value)
        {
            var user = GetUserFromUserNewDTO(value);
            return base.Post(user, false);
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

        /*
        [AllowAnonymous]
        [HttpPost("reset-password/{emailAddress}")]
        public void ResetPassword(string emailAddress)
        {
            throw new NotImplementedException();
        }
        */

        private User GetUserFromUserNewDTO(UserNewDTO userNew)
        {
            var user = new User();

            if (!User.Claims.Any()) //This could be a request to add a new user from a...new user. Nobody logged in!
                SetCreatedAuditFields(user, 0);
            else
                SetCreatedAuditFields(user);

            user.Settings.CreatedDateTime = user.CreatedDateTime;
            user.Settings.CreatedByUserId = user.CreatedByUserId;

            user.Settings.RepSettings = UserSettings.GetDefaultMinMaxRepsSettings();

            foreach (var repSetting in user.Settings.RepSettings)
            {
                repSetting.CreatedDateTime = user.CreatedDateTime;
                repSetting.CreatedByUserId = user.CreatedByUserId;
            }

            user.Name = userNew.UserName;
            user.EmailAddress = userNew.EmailAddress;
            user.Role = userNew.Role;
            user.Salt = _cryptoService.GenerateSalt();
            user.HashedPassword = _cryptoService.ComputeHash(userNew.Password, user.Salt);
            return user;
        }
    }
}