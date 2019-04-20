using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace WorkoutTracker.UI.Models
{
    public class ExerciseDTO
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string TargetAreas { get; set; }
    }
}
