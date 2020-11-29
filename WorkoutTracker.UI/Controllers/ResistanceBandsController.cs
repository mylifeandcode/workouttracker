using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using WorkoutApplication.Domain.Resistances;
using WorkoutTracker.Application.Resistances;

namespace WorkoutTracker.UI.Controllers
{
    [Produces("application/json")]
    [Route("api/ResistanceBands")]
    [EnableCors("SiteCorsPolicy")]
    [ApiController]
    public class ResistanceBandsController : SimpleAPIControllerBase<ResistanceBand>
    {
        public ResistanceBandsController(IResistanceBandService service) : base(service)
        {
        }
    }
}
