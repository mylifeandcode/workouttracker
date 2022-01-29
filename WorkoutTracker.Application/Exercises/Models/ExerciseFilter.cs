using System;
using System.Collections.Generic;
using System.Text;
using WorkoutTracker.Domain.Exercises;

namespace WorkoutTracker.Application.Exercises.Models
{
    public class ExerciseFilter
    {
        public string NameContains { get; set; }
        public List<string> HasTargetAreas { get; set; }
    }
}
