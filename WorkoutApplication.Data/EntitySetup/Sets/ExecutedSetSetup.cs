using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.EntityFrameworkCore;
using WorkoutApplication.Domain.Sets;

namespace WorkoutApplication.Data.EntitySetup.Sets
{
    public class ExecutedSetSetup : EntitySetupBase, IEntitySetup
    {
        public void Setup(ModelBuilder builder)
        {
            builder.Entity<ExecutedSet>().HasOne(x => x.Set);
            builder.Entity<ExecutedSet>().HasMany(x => x.ExecutedExercises);
            base.SetupAuditFields<ExecutedSet>(builder);
        }
    }
}
