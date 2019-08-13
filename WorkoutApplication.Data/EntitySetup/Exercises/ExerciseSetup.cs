using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.EntityFrameworkCore;
using WorkoutApplication.Domain.Exercises;

namespace WorkoutApplication.Data.EntitySetup.Exercises
{
    public class ExerciseSetup : EntitySetupBase, IEntitySetup
    {
        public void Setup(ModelBuilder builder)
        {
            var entity = builder.Entity<Exercise>();

            entity.Property(x => x.Description).HasMaxLength(4096).IsRequired();
            entity.Property(x => x.Setup).HasMaxLength(4096);
            entity.Property(x => x.Movement).HasMaxLength(4096).IsRequired();
            entity.Property(x => x.PointsToRemember).HasMaxLength(4096);

            entity
                .HasMany(x => x.ExerciseTargetAreaLinks)
                .WithOne(x => x.Exercise)
                .HasForeignKey(x => x.ExerciseId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(x => x.Name);

            base.SetupAuditFields<Exercise>(builder);
        }
    }
}
