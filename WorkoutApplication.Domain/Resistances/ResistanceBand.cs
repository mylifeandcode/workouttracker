using System;
using System.Collections.Generic;
using System.Text;
using WorkoutApplication.Domain.BaseClasses;

namespace WorkoutApplication.Domain.Resistances
{
    /// <summary>
    /// This class represents a resistance band for use in selecting in the UI.
    /// </summary>
    public class ResistanceBand : Entity
    {
        public string Color { get; set; }
        public decimal ResistanceAmount { get; set; }
    }
}
