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

        [HttpGet]
        public override ActionResult<IEnumerable<ResistanceBand>> Get()
        {
            return base.Get();
        }

        [HttpGet("{id}")]
        public override ActionResult<ResistanceBand> Get(int id)
        {
            return base.Get(id);
        }

        [HttpPost]
        public override ActionResult<ResistanceBand> Post([FromBody] ResistanceBand value)
        {
            return base.Post(value);
        }

        [HttpPut("{id}")]
        public override ActionResult<ResistanceBand> Put(int id, [FromBody] ResistanceBand value)
        {
            return base.Put(id, value);
        }

        [HttpDelete("{id}")]
        public override IActionResult Delete(int id)
        {
            return base.Delete(id);
        }
    }
}
