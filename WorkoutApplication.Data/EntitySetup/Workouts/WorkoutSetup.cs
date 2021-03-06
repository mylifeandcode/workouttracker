﻿using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.EntityFrameworkCore;
using WorkoutApplication.Domain.Workouts;

namespace WorkoutApplication.Data.EntitySetup.Workouts
{
    public class WorkoutSetup : EntitySetupBase, IEntitySetup
    {
        public void Setup(ModelBuilder builder)
        {
            var entity = builder.Entity<Workout>();

            entity.Property(x => x.Name).HasMaxLength(50).IsRequired();
            entity.Property(x => x.UserId).IsRequired();
            entity.HasMany(x => x.Exercises);

            base.SetupAuditFields<Workout>(builder);
        }
    }
}
