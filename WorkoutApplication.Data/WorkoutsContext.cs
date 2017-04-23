using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using WorkoutApplication.Domain.Exercises;
using WorkoutApplication.Domain.Resistances;
using WorkoutApplication.Domain.Sets;
using WorkoutApplication.Domain.Workouts;

namespace WorkoutApplication.Data
{
    public class WorkoutsContext : DbContext
    {
        //Workouts
        public DbSet<Workout> Workouts { get; set; }
        public DbSet<ExecutedWorkout> ExecutedWorkouts { get; set; }

        //Sets
        public DbSet<Set> Sets { get; set; }
        public DbSet<ExecutedSet> ExecutedSets { get; set; }

        //Exercises
        public DbSet<Exercise> Exercises { get; set; }
        public DbSet<ExecutedExercise> ExecutedExercises { get; set; }
        public DbSet<TargetArea> TargetAreas { get; set; }

        //Resistances
        public DbSet<Resistance> Resistances { get; set; }
        public DbSet<ResistanceBand> ResistanceBands { get; set; }


        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder.UseSqlServer(@"Server=(localdb)\mssqllocaldb;Database=WorkoutTracker;Trusted_Connection=True;");
        }
    }
}
