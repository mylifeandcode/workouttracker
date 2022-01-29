using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;

namespace WorkoutTracker.Data.EntitySetup
{
    public abstract class EntitySetupBase
    {
        public virtual void SetupAuditFields<T>(ModelBuilder builder) where T: Domain.BaseClasses.Entity
        {
            var entity = builder.Entity<T>();

            entity.Property(x => x.CreatedByUserId).IsRequired();
            entity.Property(x => x.CreatedDateTime).IsRequired();

            entity.HasIndex(x => new
                {
                    x.CreatedByUserId,
                    x.CreatedDateTime,
                    x.ModifiedByUserId,
                    x.ModifiedDateTime
                });
        }
    }
}
