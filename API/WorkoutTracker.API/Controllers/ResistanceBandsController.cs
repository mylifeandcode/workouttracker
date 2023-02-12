using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using WorkoutTracker.Domain.Resistances;
using WorkoutTracker.Application.Resistances.Interfaces;

namespace WorkoutTracker.API.Controllers
{
    [Produces("application/json")]
    [Route("api/ResistanceBands")]
    [EnableCors("SiteCorsPolicy")]
    [Authorize]
    [ApiController]
    public class ResistanceBandsController : SimpleAPIControllerBase<ResistanceBand>
    {
        public ResistanceBandsController(IResistanceBandService service) : base(service)
        {
        }
    }
}
