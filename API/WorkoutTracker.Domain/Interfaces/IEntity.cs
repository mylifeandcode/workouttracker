using System;

namespace WorkoutTracker.Domain.Interfaces
{
    public interface IEntity
    {
        int CreatedByUserId { get; set; }
        DateTime CreatedDateTime { get; set; }
        int Id { get; set; }
        int? ModifiedByUserId { get; set; }
        DateTime? ModifiedDateTime { get; set; }
    }
}