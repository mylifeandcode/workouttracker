using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.EntityFrameworkCore;
using WorkoutTracker.Domain.Sets;

namespace WorkoutTracker.Data.EntitySetup.Sets
{
    public class TimedSetSetup : EntitySetupBase, IEntitySetup
    {
        public void Setup(ModelBuilder builder)
        {
            builder.Entity<TimedSet>().Property(x => x.TargetTime).IsRequired();
            //Audit fields setup in base class setup
        }
    }
}
