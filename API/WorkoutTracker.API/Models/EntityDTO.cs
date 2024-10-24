using System;

namespace WorkoutTracker.API.Models
{
    /// <summary>
    /// A DTO representing an entity
    /// </summary>
    /// <param name="Id">The public ID of the entity. This is not the same as the internal, integer ID.</param>
    /// <param name="CreatedDateTime">The date/time when the entity was created.</param>
    /// <param name="ModifiedDateTime">The date/time when the entity was last modified, if applicable.</param>
    public abstract record EntityDTO(Guid Id, DateTime CreatedDateTime, DateTime? ModifiedDateTime);
}
