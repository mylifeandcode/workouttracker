using System;

namespace WorkoutTracker.API.Models
{
    //WE NEED BOTH IDS HERE
    public record ExerciseDTO(
        int Id, 
        Guid PublicId, 
        DateTime CreatedDateTime, 
        DateTime? ModifiedDateTime, 
        string Name, 
        string TargetAreas);
}
