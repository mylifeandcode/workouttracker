using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace WorkoutTracker.UI.Models
{
    public record ExerciseDTO : NamedEntityDTO
    {
        public string TargetAreas { get; }

        public ExerciseDTO(int id, string name, string targetAreas) : base(id, name)
            => (TargetAreas) = targetAreas;
    }
}
