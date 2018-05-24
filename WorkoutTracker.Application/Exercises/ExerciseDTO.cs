using System;
using System.Collections.Generic;
using System.Text;
using WorkoutApplication.Domain.BaseClasses;

namespace WorkoutTracker.Application.Exercises
{
    public class ExerciseDTO : NamedEntity
    {
        public string Description { get; set; }
        public int[] SelectedTargetAreaIds { get; set; }
    }
}
