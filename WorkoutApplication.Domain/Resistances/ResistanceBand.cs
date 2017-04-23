using System;
using System.Collections.Generic;
using System.Text;
using WorkoutApplication.Domain.BaseClasses;

namespace WorkoutApplication.Domain.Resistances
{
    public class ResistanceBand : Entity
    {
        public string Color { get; set; }
        public decimal Resistance { get; set; }
    }
}
