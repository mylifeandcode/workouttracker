using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace WorkoutTracker.UI.Models
{
    public record WorkoutDTO : NamedEntityDTO
    {
        public IEnumerable<ExerciseInWorkoutDTO> Exercises { get; }

        public WorkoutDTO(int id, string name, IEnumerable<ExerciseInWorkoutDTO> exercises) : base(id, name)
            => (Exercises) = (exercises);
    }
}
