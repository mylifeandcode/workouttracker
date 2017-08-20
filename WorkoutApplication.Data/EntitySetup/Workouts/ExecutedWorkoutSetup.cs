using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.EntityFrameworkCore;
using WorkoutApplication.Domain.Workouts;

namespace WorkoutApplication.Data.EntitySetup.Workouts
{
    public class ExecutedWorkoutSetup : EntitySetupBase, IEntitySetup
    {
        public void Setup(ModelBuilder builder)
        {
            var entity = builder.Entity<ExecutedWorkout>();

            entity.Property(x => x.Journal).HasMaxLength(4096);
            entity.HasOne(x => x.Workout);

            base.SetupAuditFields<ExecutedWorkout>(builder);
        }
    }
}
