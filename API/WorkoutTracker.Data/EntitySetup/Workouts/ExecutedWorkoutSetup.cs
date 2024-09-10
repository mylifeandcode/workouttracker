using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.EntityFrameworkCore;
using WorkoutTracker.Domain.Workouts;

namespace WorkoutTracker.Data.EntitySetup.Workouts
{
    public class ExecutedWorkoutSetup : EntitySetupBase, IEntitySetup
    {
        public void Setup(ModelBuilder builder)
        {
            var entity = builder.Entity<ExecutedWorkout>();

            entity.Property(x => x.PublicId).HasDefaultValueSql("NEWID()");
            entity.Property(x => x.Journal).HasMaxLength(4096);
            entity.Property(x => x.StartDateTime).IsRequired();
            entity.Property(x => x.EndDateTime).IsRequired();

            entity.HasIndex(x => x.StartDateTime);
            entity.HasIndex(x => x.Rating);
            entity.HasIndex(x => x.PublicId);

            //When deleting an ExecutedWorkout, don't delete the associated Workout
            entity
                .HasOne(x => x.Workout)
                .WithMany()
                .OnDelete(DeleteBehavior.NoAction);

            //When deleting an ExecutedWorkout, delete the child ExecutedExercises
            entity
                .HasMany(x => x.Exercises)
                .WithOne()
                .OnDelete(DeleteBehavior.ClientCascade);

            base.SetupAuditFields<ExecutedWorkout>(builder);
        }
    }
}
