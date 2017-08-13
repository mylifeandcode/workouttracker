using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.EntityFrameworkCore;
using WorkoutApplication.Domain.Sets;

namespace WorkoutApplication.Data.EntitySetup.Sets
{
    public class ExecutedRepetitionSetSetup : EntitySetupBase, IEntitySetup
    {
        public void Setup(ModelBuilder builder)
        {
            builder.Entity<ExecutedRepetitionSet>().Property(x => x.ExecutedRepCount).IsRequired();
            //Audit field setup done in base class setup
        }
    }
}
