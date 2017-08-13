using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.EntityFrameworkCore;
using WorkoutApplication.Domain.Sets;

namespace WorkoutApplication.Data.EntitySetup.Sets
{
    public class ExecutedTimedSetSetup : EntitySetupBase, IEntitySetup
    {
        public void Setup(ModelBuilder builder)
        {
            builder.Entity<ExecutedTimedSet>().Property(x => x.ExecutedTime).IsRequired();
            //Audit field setup done in base class setup
        }
    }
}
