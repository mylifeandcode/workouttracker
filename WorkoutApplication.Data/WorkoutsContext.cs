using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using WorkoutApplication.Data.EntitySetup;
using WorkoutApplication.Domain;
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

        //Compensates for lack of many-to-many support natively in EF Core
        public DbSet<ExerciseTargetAreaLink> ExerciseTargetAreaLinks { get; set; }

        //Resistances
        public DbSet<Resistance> Resistances { get; set; }
        public DbSet<ResistanceBand> ResistanceBands { get; set; }

        //Users
        public DbSet<User> Users { get; set; }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            //TODO: Get connection string from config
            optionsBuilder.UseSqlServer(@"Server=(localdb)\mssqllocaldb;Database=WorkoutTracker;Trusted_Connection=True;");
        }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            builder.Entity<RepetitionSet>();
            builder.Entity<TimedSet>();
            builder.Entity<ExecutedRepetitionSet>();
            builder.Entity<ExecutedTimedSet>();
            base.OnModelCreating(builder);
            // Customize the ASP.NET Identity model and override the defaults if needed.
            // For example, you can rename the ASP.NET Identity table names and more.
            // Add your customizations after calling base.OnModelCreating(builder);

            SetupEntities(builder);
        }

        private void SetupEntities(ModelBuilder builder)
        {
            //I could be real fancy here and set this up via IoC, but for the purpose of this class 
            //it's not really necessary.
            var setupMgr = new EntitySetupManager();
            setupMgr.SetupEntities(builder);
        }
    }
}
