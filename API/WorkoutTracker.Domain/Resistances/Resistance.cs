using System;
using System.Collections.Generic;
using System.Text;
using WorkoutTracker.Domain.BaseClasses;

namespace WorkoutTracker.Domain.Resistances
{
    public class Resistance : Entity
    {
        public decimal Amount { get; set; }
    }
}
