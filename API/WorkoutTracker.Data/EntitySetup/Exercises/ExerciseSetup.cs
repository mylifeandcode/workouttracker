﻿using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.EntityFrameworkCore;
using WorkoutTracker.Domain.Exercises;

namespace WorkoutTracker.Data.EntitySetup.Exercises
{
    public class ExerciseSetup : EntitySetupBase, IEntitySetup
    {
        public void Setup(ModelBuilder builder)
        {
            var entity = builder.Entity<Exercise>();

            entity.Property(x => x.PublicId).HasDefaultValueSql("NEWID()");
            entity.Property(x => x.Description).HasMaxLength(4096).IsRequired();
            entity.Property(x => x.Setup).HasMaxLength(4096);
            entity.Property(x => x.Movement).HasMaxLength(4096).IsRequired();
            entity.Property(x => x.PointsToRemember).HasMaxLength(4096);

            entity
                .HasMany(x => x.ExerciseTargetAreaLinks)
                .WithOne(x => x.Exercise)
                .HasForeignKey(x => x.ExerciseId)
                .OnDelete(DeleteBehavior.Cascade);

            entity
                .Property(x => x.ResistanceType)
                .HasConversion<int>();

            entity.HasIndex(x => x.Name);
            entity.HasIndex(x => x.PublicId);

            base.SetupAuditFields<Exercise>(builder);
        }
    }
}
