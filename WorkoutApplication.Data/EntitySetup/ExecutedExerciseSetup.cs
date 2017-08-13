using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.EntityFrameworkCore;
using WorkoutApplication.Domain.Exercises;

namespace WorkoutApplication.Data.EntitySetup
{
    public class ExecutedExerciseSetup : EntitySetupBase, IEntitySetup
    {
        public void Setup(ModelBuilder builder)
        {
            builder.Entity<ExecutedExercise>().Property(x => x.Notes).HasMaxLength(4096);
            base.Setup<ExecutedExercise>(builder);
        }
    }
}
