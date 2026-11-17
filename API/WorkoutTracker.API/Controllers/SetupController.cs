using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading;
using System.Threading.Tasks;
using WorkoutTracker.API.Models;
using WorkoutTracker.Application.Users.Interfaces;
using WorkoutTracker.Application.Users.Models;

namespace WorkoutTracker.API.Controllers
{
    /// <summary>
    /// One-time initial setup: creating the first administrator on a system that has no users yet.
    /// Anonymous by necessity (there is nobody to log in as), so everything here is gated by the setup
    /// code that is printed on the API console, and shuts for good once a user exists.
    /// </summary>
    [Produces("application/json")]
    [Route("api/[controller]")]
    [EnableCors("SiteCorsPolicy")]
    [AllowAnonymous]
    [ApiController]
    public class SetupController : ControllerBase
    {
        private readonly IUserSetupService _userSetupService;

        public SetupController(IUserSetupService userSetupService)
        {
            _userSetupService = userSetupService ?? throw new ArgumentNullException(nameof(userSetupService));
        }

        [HttpGet("status")]
        public async Task<ActionResult<SetupStatusDTO>> GetStatus(CancellationToken cancellationToken = default)
        {
            return Ok(new SetupStatusDTO { SetupRequired = await _userSetupService.IsSetupRequiredAsync(cancellationToken) });
        }

        [HttpPost("first-admin")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status409Conflict)]
        [ProducesResponseType(StatusCodes.Status429TooManyRequests)]
        public async Task<IActionResult> CreateFirstAdministrator(FirstAdminRequestDTO request, CancellationToken cancellationToken = default)
        {
            var outcome = await _userSetupService.CreateFirstAdministratorAsync(
                request.UserName,
                request.EmailAddress,
                request.Password,
                request.SetupCode,
                cancellationToken);

            return outcome.Status switch
            {
                FirstAdminStatus.Created => NoContent(),
                FirstAdminStatus.AlreadySetUp => Problem(statusCode: StatusCodes.Status409Conflict, detail: "Setup has already been completed."),
                FirstAdminStatus.InvalidCode => Problem(statusCode: StatusCodes.Status400BadRequest, detail: "The setup code is not valid."),
                FirstAdminStatus.LockedOut => Problem(statusCode: StatusCodes.Status429TooManyRequests, detail: "Too many incorrect setup codes. Try again later."),
                _ => Problem(statusCode: StatusCodes.Status400BadRequest, detail: outcome.Message)
            };
        }
    }
}
