using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.EntityFrameworkCore;
using WorkoutApplication.Domain.Sets;

namespace WorkoutApplication.Data.EntitySetup.Sets
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
