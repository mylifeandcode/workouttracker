using System;
using System.Collections.Generic;
using System.Linq;
using WorkoutTracker.Domain.Exercises;
using WorkoutTracker.API.Models;

namespace WorkoutTracker.API.Mappers
{
    public class TargetAreaDTOMapper : ITargetAreaDTOMapper
    {
        public TargetAreaDTO MapFromTargetArea(TargetArea targetArea)
        {
            if (targetArea == null) throw new ArgumentNullException(nameof(targetArea));

            return new TargetAreaDTO(targetArea.Id, targetArea.Name);
        }

        public IEnumerable<TargetAreaDTO> MapFromTargetAreas(IEnumerable<TargetArea> targetAreas)
        {
            if (targetAreas == null) throw new ArgumentNullException(nameof(targetAreas));

            return targetAreas.Select(MapFromTargetArea);
        }
    }
}
