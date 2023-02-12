using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.EntityFrameworkCore;
using WorkoutTracker.Domain.Exercises;

namespace WorkoutTracker.Data.EntitySetup.Exercises
{
    public class TargetAreaSetup : EntitySetupBase, IEntitySetup
    {
        public void Setup(ModelBuilder builder)
        {
            var entity = builder.Entity<TargetArea>();

            entity.Property(x => x.Name).IsRequired().HasMaxLength(40); //A little long probably, but still...
            entity.HasIndex(x => x.Name);

            base.SetupAuditFields<TargetArea>(builder);
        }
    }
}
