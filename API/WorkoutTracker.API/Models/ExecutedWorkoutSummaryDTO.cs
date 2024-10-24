using System;

namespace WorkoutTracker.API.Models
{
    public record ExecutedWorkoutSummaryDTO(Guid Id, DateTime CreatedDateTime, DateTime? ModifiedDateTime, string Name,
        Guid WorkoutPublicId,
        DateTime? StartDateTime,
        DateTime? EndDateTime,
        string Journal) 
        : NamedEntityDTO(Id, CreatedDateTime, ModifiedDateTime, Name);
}
