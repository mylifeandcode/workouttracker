using System;
using WorkoutTracker.Domain.Users;

namespace WorkoutTracker.API.Models
{
    //WE NEED BOTH IDS HERE
    public record UserDTO(int Id, Guid PublicId, string Name, string EmailAddress, UserRole Role, UserSettings Settings);
}
