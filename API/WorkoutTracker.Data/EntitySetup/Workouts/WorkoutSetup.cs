using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.EntityFrameworkCore;
using WorkoutTracker.Domain.Workouts;

namespace WorkoutTracker.Data.EntitySetup.Workouts
{
    public class WorkoutSetup : EntitySetupBase, IEntitySetup
    {
        public void Setup(ModelBuilder builder)
        {
            var entity = builder.Entity<Workout>();

            entity.Property(x => x.PublicId).HasDefaultValueSql("NEWID()");
            entity.Property(x => x.Name).HasMaxLength(50).IsRequired();
            entity.HasMany(x => x.Exercises);
            entity.Property(x => x.Active).HasDefaultValue(true);

            entity.HasIndex(x => x.PublicId);
            entity.HasIndex(x => new { x.CreatedByUserId, x.Active, x.Name });

            base.SetupAuditFields<Workout>(builder);
        }
    }
}
