using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using WorkoutTracker.Domain.Users;
using WorkoutTracker.Application.Users.Interfaces;
using WorkoutTracker.API.Models;
using WorkoutTracker.API.Mappers;
using WorkoutTracker.Application.Workouts.Interfaces;
using WorkoutTracker.Application.Security.Interfaces;
using Microsoft.Extensions.Logging;
using WorkoutTracker.Application.Users.Models;

namespace WorkoutTracker.API.Controllers
{
    [Produces("application/json")]
    [Route("api/Users")]
    [EnableCors("SiteCorsPolicy")]
    [Authorize]
    [ApiController]
    public class UsersController : SimpleAPIControllerBase<User>
    {
        private readonly IUserService _userService;
        private readonly IExecutedWorkoutService _executedWorkoutService;
        private readonly ICryptoService _cryptoService;
        private readonly IUserDTOMapper _userDTOMapper;

        public UsersController(
            IUserService userService,
            IExecutedWorkoutService executedWorkoutService,
            ICryptoService cryptoService,
            IUserDTOMapper userDTOMapper,
            ILoggerFactory loggerFactory) : base(userService, loggerFactory)
        {
            _userService = userService ?? throw new ArgumentNullException(nameof(userService));
            _executedWorkoutService = executedWorkoutService ?? throw new ArgumentNullException(nameof(executedWorkoutService));
            _cryptoService = cryptoService ?? throw new ArgumentNullException(nameof(cryptoService));
            _userDTOMapper = userDTOMapper ?? throw new ArgumentNullException(nameof(userDTOMapper));
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

        //The inherited entity endpoints below are switched off ([NonAction]): they took the whole User entity from the
        //request, with only [Authorize] on them, so any signed-in user could read, change (including their own role) or
        //delete any other user, and a save also wiped the stored password hash and salt. The narrow endpoints further
        //down replace them.
        [NonAction]
        public override Task<ActionResult<User>> Get(int id, CancellationToken cancellationToken = default)
            => throw new NotSupportedException("Use GET api/Users/{publicId}.");

        [NonAction]
        public override Task<ActionResult<User>> Put(int id, [FromBody] User value, CancellationToken cancellationToken = default)
            => throw new NotSupportedException("Use PUT api/Users/{publicId} (administrators) or PUT api/Users/me/settings.");

        [NonAction]
        public override Task<IActionResult> Delete(int id, CancellationToken cancellationToken = default)
            => throw new NotSupportedException("Users are deactivated, not deleted: PUT api/Users/{publicId}/deactivate.");

        [HttpGet("{publicId:guid}")]
        public async Task<ActionResult<UserDTO>> GetByPublicId(Guid publicId, CancellationToken cancellationToken = default)
        {
            //A user can read themselves; reading anyone else is for administrators.
            if (!IsAdministrator && publicId != GetUserPublicId())
                return Forbid();

            //This method replaces the default implementation because we don't
            //want to return the domain object which includes the user's
            //hashed password.
            try
            {
                var entity = await _service.GetByPublicIdAsync(publicId, cancellationToken);

                if (entity == null)
                    return NotFound();
                else
                    return Ok(_userDTOMapper.MapFromUser(entity));
            }
            catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user {PublicId}.", publicId);
                return StatusCode(500, ex.Message);
            }
        }

        //Administrators only. Changes the name, email address and role, and nothing else about the user.
        [HttpPut("{publicId:guid}")]
        [Authorize(Roles = "Administrator")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        public async Task<IActionResult> UpdateUser(Guid publicId, [FromBody] UserUpdateDTO request, CancellationToken cancellationToken = default)
        {
            return ToActionResult(await _userService.UpdateProfileAsync(
                publicId, request.UserName, request.EmailAddress, request.Role, GetUserID(), cancellationToken));
        }

        //Any signed-in user, but only ever their own: the caller is taken from the token, so there is no id to tamper
        //with, and the body has no role.
        [HttpPut("me/settings")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        public async Task<IActionResult> UpdateMySettings([FromBody] UserSettingsUpdateDTO request, CancellationToken cancellationToken = default)
        {
            var settings = new UserSettingsUpdate(
                request.RecommendationsEnabled,
                request.LowestAcceptableRating,
                request.RepSettings
                    .Select(x => new UserRepSettingUpdate(x.Id, x.SetType, x.Duration, x.MinReps, x.MaxReps))
                    .ToList());

            return ToActionResult(await _userService.UpdateSettingsAsync(GetUserID(), settings, cancellationToken));
        }

        //"Delete" for a user is deactivation: no sign-in and no sessions, but their data is kept and they can be reactivated.
        [HttpPut("{publicId:guid}/deactivate")]
        [Authorize(Roles = "Administrator")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        public async Task<IActionResult> Deactivate(Guid publicId, CancellationToken cancellationToken = default)
        {
            return ToActionResult(await _userService.DeactivateAsync(publicId, GetUserID(), cancellationToken));
        }

        [HttpPut("{publicId:guid}/reactivate")]
        [Authorize(Roles = "Administrator")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        public async Task<IActionResult> Reactivate(Guid publicId, CancellationToken cancellationToken = default)
        {
            return ToActionResult(await _userService.ReactivateAsync(publicId, GetUserID(), cancellationToken));
        }

        [Authorize(Roles = "Administrator")]
        [ProducesResponseType(typeof(IEnumerable<UserSummaryDTO>), StatusCodes.Status200OK)]
        public override async Task<ActionResult<IEnumerable<User>>> Get(CancellationToken cancellationToken = default)
        {
            //This method replaces the default implementation because we don't
            //want to return the domain object which includes the user's
            //hashed password. Its declared return type still says IEnumerable<User> because
            //it overrides SimpleAPIControllerBase<User>.Get() (return types aren't covariant
            //for an unrelated DTO type), but Ok() doesn't care what shape the boxed value
            //actually is — it's a UserSummaryDTO collection. (An earlier attempt at this used
            //`new` to declare a real IEnumerable<UserSummaryDTO> return type instead of overriding —
            //that compiles, but ASP.NET Core's action discovery still finds the base method too,
            //since `new` doesn't remove it from the type's method list the way it does for normal
            //member hiding, and registers both as [HttpGet] "api/Users" — this is what the commented-out
            //`new ActionResult<UserDTO> Get(int id)` above was hitting when it says "was causing a 500
            //response": an AmbiguousMatchException, not anything wrong with the DTO itself.)
            var users = await _service.GetAllWithoutTrackingAsync(cancellationToken);
            return Ok(_userDTOMapper.MapFromUsersToSummaries(users));
        }

        [Authorize(Roles = "Administrator")]
        public override async Task<ActionResult<User>> Post([FromBody] User value, bool setAuditFields = true, CancellationToken cancellationToken = default)
        {
            int userId = this.GetUserID();
            value.Settings.ModifiedByUserId = userId;
            value.Settings.ModifiedDateTime = DateTime.Now;
            foreach (var repSetting in value.Settings.RepSettings)
            {
                repSetting.ModifiedByUserId = userId;
                repSetting.ModifiedDateTime = value.Settings.ModifiedDateTime = DateTime.Now;
            }
            // NOTE: must forward cancellationToken explicitly here — base.Post(value, setAuditFields)
            // resolves against SimpleAPIControllerBase<T>'s declared signature and would silently
            // substitute a fresh default(CancellationToken) for the omitted argument, dropping the
            // real request's token at this hop regardless of what this override received.
            return await base.Post(value, setAuditFields, cancellationToken);
        }

        //Creating users is an administrator action. The very first administrator is created through
        //SetupController (gated by the one-time setup code), not here.
        [HttpPost("new")]
        [Authorize(Roles = "Administrator")]
        public async Task<ActionResult<User>> Post([FromBody] UserNewDTO value, CancellationToken cancellationToken = default)
        {
            if (!Enum.IsDefined(typeof(UserRole), value.Role))
                return BadRequest("The role must be Standard or Administrator.");

            //SYSTEM is the hidden seed user that the API filters out of every user list.
            if (string.Equals(value.UserName?.Trim(), "SYSTEM", StringComparison.OrdinalIgnoreCase))
                return BadRequest("That user name is reserved.");

            var user = GetUserFromUserNewDTO(value);
            // Same forwarding requirement as above — see the note in the User-typed Post override.
            return await base.Post(user, false, cancellationToken);
        }

        [HttpGet("overview")]
        public async Task<ActionResult<UserOverview>> GetUserOverview(CancellationToken cancellationToken = default)
        {
            var overview = new UserOverview();
            var user = await _service.GetByIdAsync(GetUserID(), cancellationToken);

            if (user == null)
                return StatusCode(500, "User not found.");

            overview.Username = user.Name;

            var mostRecentWorkouts = await _executedWorkoutService.GetRecentAsync(1, cancellationToken);
            var mostRecentWorkout = mostRecentWorkouts.FirstOrDefault();
            if (mostRecentWorkout != null)
                overview.LastWorkoutDateTime = mostRecentWorkout.StartDateTime;

            overview.PlannedWorkoutCount = await _executedWorkoutService.GetPlannedCountAsync(GetUserID(), cancellationToken);

            return Ok(overview);
        }

        private IActionResult ToActionResult(UserAdministrationOutcome outcome)
        {
            return outcome.Result switch
            {
                UserAdministrationResult.Done => NoContent(),
                UserAdministrationResult.NotFound => NotFound(),
                UserAdministrationResult.NotPermitted => Forbid(),
                UserAdministrationResult.InvalidInput => Problem(statusCode: StatusCodes.Status400BadRequest, detail: outcome.Message),
                _ => Problem(statusCode: StatusCodes.Status409Conflict, detail: outcome.Message)
            };
        }

        private User GetUserFromUserNewDTO(UserNewDTO userNew)
        {
            var user = new User();

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
