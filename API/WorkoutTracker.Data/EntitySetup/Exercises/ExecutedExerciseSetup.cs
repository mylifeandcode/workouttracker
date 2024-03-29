﻿using Microsoft.EntityFrameworkCore;
using WorkoutTracker.Domain.Exercises;

namespace WorkoutTracker.Data.EntitySetup.Exercises
{
    public class ExecutedExerciseSetup : EntitySetupBase, IEntitySetup
    {
        public void Setup(ModelBuilder builder)
        {
            var entity = builder.Entity<ExecutedExercise>();

            entity.HasIndex(x => x.Sequence);
            entity.HasOne(x => x.Exercise);

            entity.Property(x => x.Notes).HasMaxLength(4096);
            entity.HasMany(x => x.Resistances);

            entity
                .Property(x => x.ResistanceAmount)
                .HasColumnType("decimal(18,2)");
            /*
            entity
                .HasOne(x => x.Exercise)
                .WithOne()
                .OnDelete(DeleteBehavior.NoAction);
            */
            base.SetupAuditFields<ExecutedExercise>(builder);
        }
    }
}
