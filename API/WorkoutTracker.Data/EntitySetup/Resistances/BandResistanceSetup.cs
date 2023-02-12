using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.EntityFrameworkCore;
using WorkoutTracker.Domain.Resistances;

namespace WorkoutTracker.Data.EntitySetup.Resistances
{
    public class BandResistanceSetup : EntitySetupBase, IEntitySetup
    {
        public void Setup(ModelBuilder builder)
        {
            var entity = builder.Entity<BandResistance>();

            entity.Property(x => x.Amount).IsRequired();
            entity.HasIndex(x => x.Amount);
            entity.Property(x => x.Color).HasMaxLength(25).IsRequired();
            entity.HasIndex(x => x.Color);

            base.SetupAuditFields<BandResistance>(builder);
        }
    }
}
