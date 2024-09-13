using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace WorkoutTracker.API.Models
{
    public record ExerciseDTO : NamedEntityDTO
    {
        public string TargetAreas { get; }
        public Guid PublicId { get;  }

        public ExerciseDTO(int id, string name, string targetAreas, Guid publicId) : base(id, name)
        {
            TargetAreas = targetAreas;
            PublicId = publicId;
        }
    }
}
