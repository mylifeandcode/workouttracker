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

            entity.HasIndex(x => x.StartDateTime);
            entity.HasIndex(x => x.Rating);
            entity.HasIndex(x => x.PublicId);
            entity.HasIndex(x => new { x.CreatedByUserId, x.StartDateTime, x.EndDateTime });

            //When deleting an ExecutedWorkout, don't delete the associated Workout
            entity
                .HasOne(x => x.Workout)
                .WithMany()
                .OnDelete(DeleteBehavior.NoAction);

            //When deleting an ExecutedWorkout, delete the child ExecutedExercises
            entity
                .HasMany(x => x.Exercises)
                .WithOne(executedExercise => executedExercise.ExecutedWorkout)
                .HasForeignKey(executedExercise => executedExercise.ExecutedWorkoutId)
                .OnDelete(DeleteBehavior.ClientCascade);

            base.SetupAuditFields<ExecutedWorkout>(builder);
        }
    }
}
