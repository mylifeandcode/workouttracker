using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace WorkoutTracker.UI.Models
{
    public class WorkoutDTO : NamedEntityDTO
    {
        public IEnumerable<ExerciseInWorkoutDTO> Exercises { get; set; }
    }
}
