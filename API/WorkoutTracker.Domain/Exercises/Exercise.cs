using System;
using System.Collections.Generic;
using WorkoutTracker.Domain.BaseClasses;
using WorkoutTracker.Domain.Interfaces;

namespace WorkoutTracker.Domain.Exercises
{
    public class Exercise : NamedEntity, IPublicEntity
    {
        public Guid PublicId { get; set; }
        public string Description { get; set; }
        public string Setup { get; set; }
        public string Movement { get; set; }
        public string PointsToRemember { get; set; }

        public virtual ICollection<ExerciseTargetAreaLink> ExerciseTargetAreaLinks { get; set; }

        public ResistanceType ResistanceType { get; set; }
        public bool OneSided { get; set; }
        public bool? BandsEndToEnd { get; set; }
        public bool InvolvesReps { get; set; }
        public bool UsesBilateralResistance { get; set; }
    }
}
