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
            builder.Entity<BandResistance>().Property(x => x.Amount).IsRequired();
            base.SetupAuditFields<BandResistance>(builder);
        }
    }
}
