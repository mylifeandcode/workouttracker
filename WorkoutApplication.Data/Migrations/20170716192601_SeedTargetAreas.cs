using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;
using WorkoutApplication.Domain.Exercises;

namespace WorkoutApplication.Data.Migrations
{
    public partial class SeedTargetAreas : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            var context = new WorkoutsContext();
            context.TargetAreas.Add(new TargetArea { Name = "Abs", CreatedBy = "Setup", CreatedDateTime = DateTime.Now });
            context.TargetAreas.Add(new TargetArea { Name = "Back", CreatedDateTime = DateTime.Now });
            context.TargetAreas.Add(new TargetArea { Name = "Biceps", CreatedDateTime = DateTime.Now });
            context.TargetAreas.Add(new TargetArea { Name = "Chest", CreatedDateTime = DateTime.Now });
            context.TargetAreas.Add(new TargetArea { Name = "Core", CreatedDateTime = DateTime.Now });
            context.TargetAreas.Add(new TargetArea { Name = "Legs", CreatedDateTime = DateTime.Now });
            context.TargetAreas.Add(new TargetArea { Name = "Shoulders", CreatedDateTime = DateTime.Now });
            context.TargetAreas.Add(new TargetArea { Name = "Triceps", CreatedDateTime = DateTime.Now });

            context.SaveChanges();
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            var context = new WorkoutsContext();
            context.RemoveRange(context.TargetAreas);
        }
    }
}
