using System;
using System.Collections.Generic;
using System.Text;

namespace WorkoutApplication.Domain.BaseClasses
{
    public abstract class NamedEntity : Entity
    {
        public string Name { get; set; }
    }
}
