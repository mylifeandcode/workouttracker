using System;
using System.Collections.Generic;
using System.Text;
using WorkoutApplication.Domain.BaseClasses;

namespace WorkoutApplication.Domain
{
    public class ResistanceBand : Entity
    {
        public int Id { get; set; } 
        public string Color { get; set; }
        public decimal Resistance { get; set; }
    }
}
