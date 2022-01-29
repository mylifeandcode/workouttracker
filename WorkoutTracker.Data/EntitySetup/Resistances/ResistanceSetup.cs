using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.EntityFrameworkCore;
using WorkoutTracker.Domain.Resistances;

namespace WorkoutTracker.Data.EntitySetup.Resistances
{
    public class ResistanceSetup : EntitySetupBase, IEntitySetup
    {
        public void Setup(ModelBuilder builder)
        {
            var entity = builder.Entity<Resistance>();

            entity
                .Property(x => x.Amount)
                .IsRequired()
                .HasColumnType("decimal(18,2)");

            base.SetupAuditFields<Resistance>(builder);
        }
    }
}
