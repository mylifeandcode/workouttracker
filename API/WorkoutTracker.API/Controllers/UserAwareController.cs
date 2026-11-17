using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using WorkoutTracker.Domain.BaseClasses;

namespace WorkoutTracker.API.Controllers
{
    [ApiController]
    public abstract class UserAwareController : ControllerBase
    {
        protected readonly ILogger _logger;

        protected UserAwareController(ILoggerFactory loggerFactory)
        {
            _logger = loggerFactory.CreateLogger(GetType());
        }

        protected int GetUserID()
        {
            if (User == null)
                throw new BadHttpRequestException("No current user found in request.");

            var userIdClaim = User.FindFirst("UserID");

            if (userIdClaim == null)
                throw new BadHttpRequestException("No UserID claim found for current user.");

            int userId;
            if (!Int32.TryParse(userIdClaim.Value, out userId))
                throw new BadHttpRequestException("Invalid UserID claim value for current user.");

            return userId;
        }

        /// <summary>
        /// Whether the token says the caller is an administrator. (Operations that matter most also re-check the
        /// caller's role in the database, because a token keeps its claims until it expires.)
        /// </summary>
        protected bool IsAdministrator => User?.IsInRole("Administrator") == true;

        protected Guid GetUserPublicId()
        {
            var claim = User?.FindFirst("UserPublicID");

            if (claim == null)
                throw new BadHttpRequestException("No UserPublicID claim found for current user.");

            if (!Guid.TryParse(claim.Value, out var publicId))
                throw new BadHttpRequestException("Invalid UserPublicID claim value for current user.");

            return publicId;
        }

        protected void SetCreatedAuditFields(Entity entity, int? createdByUserId = null)
        {
            int userId = createdByUserId ?? GetUserID();
            entity.CreatedByUserId = userId;
            entity.CreatedDateTime = DateTime.Now;
        }

        protected void SetModifiedAuditFields(Entity entity)
        {
            var userId = GetUserID();
            entity.ModifiedByUserId = userId;
            entity.ModifiedDateTime = DateTime.Now;
        }

    }
}
