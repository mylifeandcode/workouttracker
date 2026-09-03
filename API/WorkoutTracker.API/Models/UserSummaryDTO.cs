using System;

namespace WorkoutTracker.API.Models
{
    //WE NEED BOTH IDS HERE
    public record UserSummaryDTO(int Id, Guid PublicId, string Name);
}
