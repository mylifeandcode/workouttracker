using System;
using System.Collections.Generic;
using System.Text;
using WorkoutApplication.Domain.BaseClasses;

namespace WorkoutApplication.Domain.Exercises
{
    public class Exercise : NamedEntity
    {
        public string Description { get; set; }

        public virtual ICollection<ExerciseTargetAreaLink> ExerciseTargetAreaLinks { get; set; }
    }
}
