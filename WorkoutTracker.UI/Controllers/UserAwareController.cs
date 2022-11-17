using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using WorkoutTracker.Domain.BaseClasses;

namespace WorkoutTracker.UI.Controllers
{
    [ApiController]
    public abstract class UserAwareController : ControllerBase
    {
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
