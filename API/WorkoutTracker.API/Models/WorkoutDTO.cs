using System;

namespace WorkoutTracker.API.Models
{
    public record WorkoutDTO(Guid Id, DateTime CreatedDateTime, DateTime? ModifiedDateTime, string Name,
        string TargetAreas,
        bool Active)
        : NamedEntityDTO(Id, CreatedDateTime, ModifiedDateTime, Name);
}
