using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace WorkoutTracker.API.Models
{
    public record WorkoutDTO : NamedEntityDTO
    {
        public IEnumerable<ExerciseInWorkoutDTO> Exercises { get; }
        public string TargetAreas { get; }
        public bool Active { get; set; }

        public WorkoutDTO(int id, string name, IEnumerable<ExerciseInWorkoutDTO> exercises, string targetAreas, bool active) : base(id, name)
            => (Exercises, TargetAreas, Active) = (exercises, targetAreas, active);
    }
}
