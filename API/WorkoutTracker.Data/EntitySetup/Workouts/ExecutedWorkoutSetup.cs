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

            entity.Property(x => x.Journal).HasMaxLength(4096);
            entity.Property(x => x.StartDateTime).IsRequired();
            entity.Property(x => x.EndDateTime).IsRequired();

            entity.HasIndex(x => x.StartDateTime);
            entity.HasIndex(x => x.Rating);

            //entity.HasOne(x => x.Workout);

            entity
                .HasOne(x => x.Workout)
                .WithMany()
                .HasForeignKey(x => x.WorkoutId)
                .OnDelete(DeleteBehavior.NoAction);

            entity.HasMany(x => x.Exercises)
                .WithOne()
                .HasForeignKey(x => x.ExerciseId)
                .OnDelete(DeleteBehavior.Cascade);

            base.SetupAuditFields<ExecutedWorkout>(builder);
        }
    }
}
