using System;
using System.Collections.Generic;
using System.Text;
using WorkoutTracker.Domain.BaseClasses;

namespace WorkoutTracker.Domain.Resistances
{
    /// <summary>
    /// This class represents a resistance band for use in selecting in the UI.
    /// </summary>
    public class ResistanceBand : Entity
    {
        public string Color { get; set; }
        public decimal MaxResistanceAmount { get; set; }
        public short NumberAvailable { get; set; }
    }
}
