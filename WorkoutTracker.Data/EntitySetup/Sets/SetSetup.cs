using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.EntityFrameworkCore;
using WorkoutTracker.Domain.Sets;

namespace WorkoutTracker.Data.EntitySetup.Sets
{
    public class SetSetup : EntitySetupBase, IEntitySetup
    {
        public void Setup(ModelBuilder builder)
        {
            var entity = builder.Entity<Set>();

            entity.Property(x => x.Sequence).IsRequired();
            entity.HasOne(x => x.Exercise);

            base.SetupAuditFields<Set>(builder);
        }
    }
}
