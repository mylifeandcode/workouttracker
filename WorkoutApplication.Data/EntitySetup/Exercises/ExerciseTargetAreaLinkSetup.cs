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
            var entity = builder.Entity<ExerciseTargetAreaLink>();

            entity
                .HasOne(l => l.Exercise)
                .WithMany(e => e.ExerciseTargetAreaLinks)
                .IsRequired();
            //.HasForeignKey(l => l.ExerciseId);

            entity
                .HasOne(x => x.TargetArea);
                //.WithMany(x => x.ExerciseTargetAreaLinks);
                //.HasForeignKey(x => x.TargetAreaId);
        }
    }
}
