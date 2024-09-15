using System;
using System.Collections.Generic;
using System.Text;
using WorkoutTracker.Domain.BaseClasses;
using WorkoutTracker.Domain.Interfaces;

namespace WorkoutTracker.Domain.Resistances
{
    /// <summary>
    /// This class represents a resistance band for use in selecting in the UI.
    /// </summary>
    public class ResistanceBand : Entity, IPublicEntity
    {
        public string Color { get; set; }
        public decimal MaxResistanceAmount { get; set; }
        public short NumberAvailable { get; set; }
        public Guid PublicId { get; set; }
    }
}
