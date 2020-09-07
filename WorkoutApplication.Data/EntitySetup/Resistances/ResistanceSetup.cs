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
            var entity = builder.Entity<Resistance>();

            entity.Property(x => x.Amount).IsRequired();//.HasColumnType("int");

            base.SetupAuditFields<Resistance>(builder);
        }
    }
}
