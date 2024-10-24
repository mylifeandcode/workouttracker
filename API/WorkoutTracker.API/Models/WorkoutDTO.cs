using System;
using System.Collections.Generic;

namespace WorkoutTracker.API.Models
{
    public record WorkoutDTO(Guid Id, DateTime CreatedDateTime, DateTime? ModifiedDateTime, string Name,
        IEnumerable<ExerciseInWorkoutDTO> Exercises,
        string TargetAreas,
        bool Active) 
        : NamedEntityDTO(Id, CreatedDateTime, ModifiedDateTime, Name);
}
