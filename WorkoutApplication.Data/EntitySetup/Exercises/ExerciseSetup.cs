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

            entity
                .HasMany(x => x.ExerciseTargetAreaLinks)
                .WithOne(x => x.Exercise)
                .HasForeignKey(x => x.ExerciseId);

            entity.HasIndex(x => x.Name);

            base.SetupAuditFields<Exercise>(builder);
        }
    }
}
