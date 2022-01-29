using System;
using System.Collections.Generic;
using System.Text;

namespace WorkoutTracker.Domain.Exercises
{
    /// <summary>
    /// An enumeration of the different types of resistance an exercise can have
    /// </summary>
    public enum ResistanceType
    {
        FreeWeight, 
        MachineWeight, 
        ResistanceBand, 
        BodyWeight, 
        Other
    }
}
