using System;

namespace WorkoutTracker.API.Models
{
    public abstract record NamedEntityDTO(Guid Id, DateTime CreatedDateTime, DateTime? ModifiedDateTime, string Name)
        : EntityDTO(Id, CreatedDateTime, ModifiedDateTime);
}
