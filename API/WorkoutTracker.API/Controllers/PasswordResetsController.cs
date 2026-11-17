using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Threading;
using System.Threading.Tasks;
using WorkoutTracker.API.Models;
using WorkoutTracker.Application.Users.Interfaces;
using WorkoutTracker.Application.Users.Models;

namespace WorkoutTracker.API.Controllers
{
    /// <summary>
    /// Password reset on behalf of a user, for installations that can't send email: an administrator creates a one-time
    /// reset token and hands it to the person. The only place the API returns a reset token.
    /// </summary>
    [Produces("application/json")]
    [Route("api/Users/{publicId:guid}/password-reset")]
    [EnableCors("SiteCorsPolicy")]
    [Authorize(Roles = "Administrator")]
    [ApiController]
    public class PasswordResetsController : UserAwareController
    {
        private readonly IPasswordResetService _passwordResetService;

        public PasswordResetsController(IPasswordResetService passwordResetService, ILoggerFactory loggerFactory) : base(loggerFactory)
        {
            _passwordResetService = passwordResetService ?? throw new ArgumentNullException(nameof(passwordResetService));
        }

        [HttpPost]
        [ProducesResponseType(typeof(PasswordResetTokenDTO), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<PasswordResetTokenDTO>> Create(Guid publicId, CancellationToken cancellationToken = default)
        {
            var outcome = await _passwordResetService.CreateResetForAdminAsync(publicId, GetUserID(), cancellationToken);

            return outcome.Result switch
            {
                PasswordResetResult.Done => Ok(new PasswordResetTokenDTO { Token = outcome.Token!, ExpiresAt = outcome.ExpiresAt!.Value }),
                PasswordResetResult.NotPermitted => Forbid(),
                _ => NotFound()
            };
        }
    }
}
