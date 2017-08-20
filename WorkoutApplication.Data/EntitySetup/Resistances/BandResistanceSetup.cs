using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.EntityFrameworkCore;
using WorkoutApplication.Domain.Resistances;

namespace WorkoutApplication.Data.EntitySetup.Resistances
{
    public class BandResistanceSetup : EntitySetupBase, IEntitySetup
    {
        public void Setup(ModelBuilder builder)
        {
            var entity = builder.Entity<BandResistance>();

            entity.Property(x => x.Amount).IsRequired();
            entity.HasIndex(x => x.Amount);
            entity.HasIndex(x => x.Color);

            base.SetupAuditFields<BandResistance>(builder);
        }
    }
}
