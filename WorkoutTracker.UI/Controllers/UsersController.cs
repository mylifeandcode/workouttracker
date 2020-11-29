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
    }
}