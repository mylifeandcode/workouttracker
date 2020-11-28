using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.EntityFrameworkCore;
using WorkoutApplication.Domain.Resistances;

namespace WorkoutApplication.Data.EntitySetup.Resistances
{
    public class ResistanceBandSetup : EntitySetupBase, IEntitySetup
    {
        public void Setup(ModelBuilder builder)
        {
            var entity = builder.Entity<ResistanceBand>();

            entity.Property(x => x.Color).HasMaxLength(25).IsRequired();
            entity.HasIndex(x => x.Color);

            base.SetupAuditFields<ResistanceBand>(builder);
        }
    }
}
