using Microsoft.EntityFrameworkCore.Migrations;
using System;
using System.Collections.Generic;
using WorkoutApplication.Domain.Exercises;

namespace WorkoutApplication.Data.Migrations
{
    public partial class SeedTargetAreas : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            var context = new WorkoutsContext();
            //TODO: Create Setup User for UserId below to maintain referential integrity
            context.TargetAreas.Add(new TargetArea { Name = "Abs", CreatedByUserId = 0, CreatedDateTime = DateTime.Now });
            context.TargetAreas.Add(new TargetArea { Name = "Back", CreatedByUserId = 0, CreatedDateTime = DateTime.Now });
            context.TargetAreas.Add(new TargetArea { Name = "Biceps", CreatedByUserId = 0, CreatedDateTime = DateTime.Now });
            context.TargetAreas.Add(new TargetArea { Name = "Chest", CreatedByUserId = 0, CreatedDateTime = DateTime.Now });
            context.TargetAreas.Add(new TargetArea { Name = "Core", CreatedByUserId = 0, CreatedDateTime = DateTime.Now });
            context.TargetAreas.Add(new TargetArea { Name = "Legs", CreatedByUserId = 0, CreatedDateTime = DateTime.Now });
            context.TargetAreas.Add(new TargetArea { Name = "Shoulders", CreatedByUserId = 0, CreatedDateTime = DateTime.Now });
            context.TargetAreas.Add(new TargetArea { Name = "Triceps", CreatedByUserId = 0, CreatedDateTime = DateTime.Now });

            context.SaveChanges();
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            var context = new WorkoutsContext();
            context.RemoveRange(context.TargetAreas);
        }
    }
}
