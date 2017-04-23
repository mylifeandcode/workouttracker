using System;
using System.Collections.Generic;
using System.Text;
using WorkoutApplication.Domain.BaseClasses;

namespace WorkoutApplication.Domain
{
    public class Exercise : NamedEntity
    {
        public string Description { get; set; }
        public virtual IEnumerable<TargetArea> TargetAreas { get; set; }
    }
}
