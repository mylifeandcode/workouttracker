using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.EntityFrameworkCore;
using WorkoutApplication.Domain.Exercises;

namespace WorkoutApplication.Data.EntitySetup.Exercises
{
    public class ExecutedExerciseSetup : EntitySetupBase, IEntitySetup
    {
        public void Setup(ModelBuilder builder)
        {
            var entity = builder.Entity<ExecutedExercise>();

            entity.HasIndex(x => x.Sequence);
            entity.HasOne(x => x.Exercise);
            //entity.Property(x => x.TargetRepCount).IsRequired();
            //entity.Property(x => x.ActualRepCount).IsRequired();
            entity.Property(x => x.Notes).HasMaxLength(4096);
            entity.HasMany(x => x.Resistances);

            base.SetupAuditFields<ExecutedExercise>(builder);
        }
    }
}
