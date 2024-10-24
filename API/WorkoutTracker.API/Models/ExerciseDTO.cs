using System;

namespace WorkoutTracker.API.Models
{
    public record ExerciseDTO(Guid Id, DateTime CreatedDateTime, DateTime? ModifiedDateTime, string Name, 
        string TargetAreas) 
        : NamedEntityDTO(Id, CreatedDateTime, ModifiedDateTime, Name);
}
