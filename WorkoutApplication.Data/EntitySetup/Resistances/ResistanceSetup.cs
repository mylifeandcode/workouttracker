using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.EntityFrameworkCore;
using WorkoutApplication.Domain.Resistances;

namespace WorkoutApplication.Data.EntitySetup.Resistances
{
    public class ResistanceSetup : EntitySetupBase, IEntitySetup
    {
        public void Setup(ModelBuilder builder)
        {
            builder.Entity<Resistance>().Property(x => x.Amount).IsRequired();
            base.SetupAuditFields<Resistance>(builder);
        }
    }
}
