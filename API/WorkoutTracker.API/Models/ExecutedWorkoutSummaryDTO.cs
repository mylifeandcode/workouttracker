using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace WorkoutTracker.API.Models
{
    public record ExecutedWorkoutSummaryDTO : NamedEntityDTO
    {
        public DateTime? StartDateTime { get; }
        public DateTime? EndDateTime { get; }
        public DateTime CreatedDateTime { get; }
        public Guid WorkoutPublicId { get; }
        public string Journal { get; }
        public Guid PublicId { get; }

        public ExecutedWorkoutSummaryDTO(int id, string name, Guid workoutPublicId, DateTime? startDateTime, DateTime? endDateTime, DateTime createdDateTime, string journal, Guid publicId): base(id, name)
            => (WorkoutPublicId, StartDateTime, EndDateTime, CreatedDateTime, Journal, PublicId) = (workoutPublicId, startDateTime, endDateTime, createdDateTime, journal, publicId);
    }
}
