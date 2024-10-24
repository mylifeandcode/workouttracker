using System;
using System.Collections.Generic;

namespace WorkoutTracker.API.Models
{
    public record ExecutedWorkoutDTO(Guid Id, DateTime CreatedDateTime, DateTime? ModifiedDateTime, string Name,
        Guid WorkoutId,
        DateTime? StartDateTime,
        DateTime? EndDateTime,
        string Journal,
        int Rating,
        IEnumerable<ExecutedExerciseDTO> Exercises) 
        : NamedEntityDTO(Id, CreatedDateTime, ModifiedDateTime, Name);
}
