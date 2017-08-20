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
            var entity = builder.Entity<ExecutedSet>();

            entity.HasOne(x => x.Set);
            entity.HasOne(x => x.ExecutedExercise);

            base.SetupAuditFields<ExecutedSet>(builder);
        }
    }
}
