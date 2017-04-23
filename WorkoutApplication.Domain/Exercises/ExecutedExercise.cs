using System;
using System.Collections.Generic;
using System.Text;
using WorkoutApplication.Domain.BaseClasses;
using WorkoutApplication.Domain.Resistances;

namespace WorkoutApplication.Domain.Exercises
{
    public class ExecutedExercise : Entity
    {
        public virtual Exercise Exercise { get; set; }
        public string Notes { get; set; }
        public virtual IEnumerable<Resistance> Resistances { get; set; }
    }
}
