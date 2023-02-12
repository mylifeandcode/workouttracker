using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace WorkoutTracker.API.Models
{
    public record ExecutedWorkoutDTO : NamedEntityDTO
    {
        public DateTime? StartDateTime { get; }
        public DateTime? EndDateTime { get; }
        public DateTime CreatedDateTime { get; }
        public int WorkoutId { get; }
        public string Journal { get; }

        public ExecutedWorkoutDTO(int id, string name, int workoutId, DateTime? startDateTime, DateTime? endDateTime, DateTime createdDateTime, string journal): base(id, name)
            => (WorkoutId, StartDateTime, EndDateTime, CreatedDateTime, Journal) = (workoutId, startDateTime, endDateTime, createdDateTime, journal);
    }
}
