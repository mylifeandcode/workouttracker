using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using WorkoutApplication.Domain.Resistances;
using WorkoutTracker.Application.Resistances;

namespace WorkoutTracker.UI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ResistanceBandsController : SimpleAPIControllerBase<ResistanceBand>
    {
        public ResistanceBandsController(IResistanceBandService service) : base(service)
        {
        }
    }
}
