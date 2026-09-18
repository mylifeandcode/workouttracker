using System;
using System.Collections.Generic;
using System.Linq;
using WorkoutTracker.Domain.Resistances;
using WorkoutTracker.API.Models;

namespace WorkoutTracker.API.Mappers
{
    public class ResistanceBandDTOMapper : IResistanceBandDTOMapper
    {
        public ResistanceBandDTO MapFromResistanceBand(ResistanceBand resistanceBand)
        {
            if (resistanceBand == null) throw new ArgumentNullException(nameof(resistanceBand));

            return new ResistanceBandDTO(
                resistanceBand.Id,
                resistanceBand.PublicId,
                resistanceBand.Color,
                resistanceBand.MaxResistanceAmount,
                resistanceBand.NumberAvailable,
                resistanceBand.CreatedByUserId,
                resistanceBand.CreatedDateTime,
                resistanceBand.ModifiedByUserId,
                resistanceBand.ModifiedDateTime);
        }

        public IEnumerable<ResistanceBandDTO> MapFromResistanceBands(IEnumerable<ResistanceBand> resistanceBands)
        {
            if (resistanceBands == null) throw new ArgumentNullException(nameof(resistanceBands));

            return resistanceBands.Select(MapFromResistanceBand);
        }
    }
}
