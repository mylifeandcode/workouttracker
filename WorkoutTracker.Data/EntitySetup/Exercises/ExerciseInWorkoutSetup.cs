using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.EntityFrameworkCore;
using WorkoutTracker.Domain.Exercises;

namespace WorkoutTracker.Data.EntitySetup.Exercises
{
    public class ExerciseInWorkoutSetup : EntitySetupBase, IEntitySetup
    {
        public void Setup(ModelBuilder builder)
        {
            var entity = builder.Entity<ExerciseInWorkout>();

            entity.HasOne(e => e.Exercise);
            entity.Property(p => p.NumberOfSets).IsRequired(); //TODO: How can I use Fluent API to specify min value of 0?

            base.SetupAuditFields<ExecutedExercise>(builder);
        }
    }
}
