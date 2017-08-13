using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.EntityFrameworkCore;
using WorkoutApplication.Domain.Exercises;

namespace WorkoutApplication.Data.EntitySetup.Exercises
{
    public class TargetAreaSetup : EntitySetupBase, IEntitySetup
    {
        public void Setup(ModelBuilder builder)
        {
            builder.Entity<TargetArea>().Property(x => x.Name).IsRequired().HasMaxLength(40); //A little long probably, but still...
            base.SetupAuditFields<TargetArea>(builder);
        }
    }
}
