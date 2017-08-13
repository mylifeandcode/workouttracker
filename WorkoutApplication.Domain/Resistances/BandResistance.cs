using System;
using System.Collections.Generic;
using System.Text;

namespace WorkoutApplication.Domain.Resistances
{
    public class BandResistance : Resistance
    {
        //TODO: Re-evaluate the need for this class, or the design of it.
        //May want a version of this that contains an enumeration of resistance bands and aggregates their 
        //resistance amounts.
        public string Color { get; set; }
    }
}
