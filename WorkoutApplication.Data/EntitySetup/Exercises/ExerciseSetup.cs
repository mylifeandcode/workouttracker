using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.EntityFrameworkCore;
using WorkoutApplication.Domain.Exercises;

namespace WorkoutApplication.Data.EntitySetup.Exercises
{
    public class ExerciseSetup : EntitySetupBase, IEntitySetup
    {
        public void Setup(ModelBuilder builder)
        {
            builder.Entity<Exercise>().Property(x => x.Description).IsRequired();
            base.SetupAuditFields<Exercise>(builder);
        }
    }
}
