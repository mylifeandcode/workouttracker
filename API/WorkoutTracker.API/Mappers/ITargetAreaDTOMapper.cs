using System.Collections.Generic;
using WorkoutTracker.Domain.Exercises;
using WorkoutTracker.API.Models;

namespace WorkoutTracker.API.Mappers
{
    public interface ITargetAreaDTOMapper
    {
        TargetAreaDTO MapFromTargetArea(TargetArea targetArea);
        IEnumerable<TargetAreaDTO> MapFromTargetAreas(IEnumerable<TargetArea> targetAreas);
    }
}
