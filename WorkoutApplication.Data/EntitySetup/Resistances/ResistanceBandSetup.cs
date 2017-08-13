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
            builder.Entity<ResistanceBand>().Property(x => x.Color).HasMaxLength(20).IsRequired();
            base.SetupAuditFields<ResistanceBand>(builder);
        }
    }
}
