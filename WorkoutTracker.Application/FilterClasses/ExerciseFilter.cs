using System;
using System.Collections.Generic;
using System.Text;
using WorkoutApplication.Domain.Exercises;

namespace WorkoutTracker.Application.FilterClasses
{
    public class ExerciseFilter
    {
        public string NameContains { get; set; }
        public List<string> HasTargetAreas { get; set; }
    }
}
