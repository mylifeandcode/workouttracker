using System;
using System.Collections.Generic;
using System.Text;
using WorkoutApplication.Domain.BaseClasses;

namespace WorkoutApplication.Domain.Exercises
{
    /// <summary>
    /// A class that compensates for the lack of WithMany() after HasMany() in EF Core.
    /// https://github.com/aspnet/EntityFramework/issues/6541
    /// https://docs.microsoft.com/en-us/ef/core/modeling/relationships#many-to-many
    /// </summary>
    public class ExerciseTargetAreaLink : Entity
    {
        public int ExerciseId { get; set; }
        public int TargetAreaId { get; set; }
        public virtual Exercise Exercise { get; set; }
        public virtual TargetArea TargetArea { get; set; }
    }
}
