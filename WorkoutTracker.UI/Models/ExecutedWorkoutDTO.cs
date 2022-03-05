using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace WorkoutTracker.UI.Models
{
    public record ExecutedWorkoutDTO : NamedEntityDTO
    {
        public DateTime? StartDateTime { get; }
        public DateTime? EndDateTime { get; }
        public DateTime CreatedDateTime { get; }
        public int WorkoutId { get; }

        public ExecutedWorkoutDTO(int id, string name, int workoutId, DateTime? startDateTime, DateTime? endDateTime, DateTime createdDateTime): base(id, name)
            => (WorkoutId, StartDateTime, EndDateTime, CreatedDateTime) = (workoutId, startDateTime, endDateTime, createdDateTime);
    }
}
