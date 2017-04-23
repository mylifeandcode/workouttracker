using System;
using System.Collections.Generic;
using System.Text;
using WorkoutApplication.Domain.BaseClasses;
using WorkoutApplication.Domain.Sets;

namespace WorkoutApplication.Domain.Workouts
{
    public class Workout : NamedEntity
    {
        public virtual IEnumerable<Set> Sets { get; set; }
    }
}
