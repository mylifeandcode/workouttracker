using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;

namespace WorkoutApplication.Data.EntitySetup
{
    public abstract class EntitySetupBase
    {
        public virtual void SetupAuditFields<T>(ModelBuilder builder) where T: Domain.BaseClasses.Entity
        {
            //The max length of 50 below is probably a bit high, but better safe than sorry
            builder.Entity<T>().Property(x => x.CreatedBy).IsRequired().HasMaxLength(50);
            builder.Entity<T>().Property(x => x.CreatedDateTime).IsRequired();
            builder.Entity<T>().Property(x => x.ModifiedBy).HasMaxLength(50);
        }
    }
}
