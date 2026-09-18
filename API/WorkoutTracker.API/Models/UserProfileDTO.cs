using System;

namespace WorkoutTracker.API.Models
{
    public record UserProfileDTO(Guid PublicId, string Name);
}
