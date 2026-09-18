using System.Collections.Generic;
using WorkoutTracker.Domain.Resistances;
using WorkoutTracker.API.Models;

namespace WorkoutTracker.API.Mappers
{
    public interface IResistanceBandDTOMapper
    {
        ResistanceBandDTO MapFromResistanceBand(ResistanceBand resistanceBand);
        IEnumerable<ResistanceBandDTO> MapFromResistanceBands(IEnumerable<ResistanceBand> resistanceBands);
    }
}
