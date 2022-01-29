using System;
using System.Collections.Generic;
using System.Text;
using WorkoutTracker.Domain.BaseClasses;

namespace WorkoutTracker.Domain.Exercises
{
    public class Exercise : NamedEntity
    {
        public string Description { get; set; }
        public string Setup { get; set; }
        public string Movement { get; set; }
        public string PointsToRemember { get; set; }

        public virtual ICollection<ExerciseTargetAreaLink> ExerciseTargetAreaLinks { get; set; }

        public ResistanceType ResistanceType { get; set; }
        public bool OneSided { get; set; }
        public bool? BandsEndToEnd { get; set; }
    }
}
