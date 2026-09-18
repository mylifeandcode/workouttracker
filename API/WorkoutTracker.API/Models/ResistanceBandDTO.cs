using System;

namespace WorkoutTracker.API.Models
{
    public record ResistanceBandDTO(
        int Id,
        Guid PublicId,
        string Color,
        decimal MaxResistanceAmount,
        short NumberAvailable,
        int CreatedByUserId,
        DateTime CreatedDateTime,
        int? ModifiedByUserId,
        DateTime? ModifiedDateTime);
}
