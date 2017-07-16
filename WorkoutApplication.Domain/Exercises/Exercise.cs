using System;
using System.Collections.Generic;
using System.Text;
using WorkoutApplication.Domain.BaseClasses;

namespace WorkoutApplication.Domain.Exercises
{
    public class Exercise : NamedEntity
    {
        public string Description { get; set; }

        //TODO: Need to make adjustment in DbContext so that the below property works correctly
        public virtual IEnumerable<TargetArea> TargetAreas { get; set; }
    }
}
