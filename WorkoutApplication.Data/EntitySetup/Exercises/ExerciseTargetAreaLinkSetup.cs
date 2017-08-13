using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.EntityFrameworkCore;
using WorkoutApplication.Domain.Exercises;

namespace WorkoutApplication.Data.EntitySetup.Exercises
{
    public class ExerciseTargetAreaLinkSetup : IEntitySetup
    {
        public void Setup(ModelBuilder builder)
        {
            //Currently no native many-to-many support in EF Core. :(
            //https://docs.microsoft.com/en-us/ef/core/modeling/relationships#many-to-many
            //Here's the workaround.
            builder.Entity<ExerciseTargetAreaLink>()
                .HasOne(l => l.Exercise)
                .WithMany(e => e.ExerciseTargetAreaLinks)
                .HasForeignKey(l => l.ExerciseId);

            builder.Entity<ExerciseTargetAreaLink>()
                .HasOne(l => l.TargetArea)
                .WithMany(t => t.ExerciseTargetAreaLinks)
                .HasForeignKey(l => l.TargetAreaId);
        }
    }
}
