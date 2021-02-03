using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace WorkoutTracker.UI.Models
{
    public record ExecutedWorkoutDTO : NamedEntityDTO
    {
        public DateTime StartDateTime { get; }
        public DateTime EndDateTime { get; }

        public ExecutedWorkoutDTO(int id, string name, DateTime startDateTime, DateTime endDateTime): base(id, name)
            => (StartDateTime, EndDateTime) = (startDateTime, endDateTime);
    }
}
