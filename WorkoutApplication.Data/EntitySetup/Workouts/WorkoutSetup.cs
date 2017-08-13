using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.EntityFrameworkCore;
using WorkoutApplication.Domain.Workouts;

namespace WorkoutApplication.Data.EntitySetup.Workouts
{
    public class WorkoutSetup : EntitySetupBase, IEntitySetup
    {
        public void Setup(ModelBuilder builder)
        {
            builder.Entity<Workout>().Property(x => x.Name).HasMaxLength(50).IsRequired();
            builder.Entity<Workout>().Property(x => x.UserId).IsRequired();
            builder.Entity<Workout>().HasMany(x => x.Sets);
            base.SetupAuditFields<Workout>(builder);
        }
    }
}
