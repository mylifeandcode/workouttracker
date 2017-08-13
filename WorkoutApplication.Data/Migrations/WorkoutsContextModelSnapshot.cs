using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;
using WorkoutApplication.Data;

namespace WorkoutApplication.Data.Migrations
{
    [DbContext(typeof(WorkoutsContext))]
    partial class WorkoutsContextModelSnapshot : ModelSnapshot
    {
        protected override void BuildModel(ModelBuilder modelBuilder)
        {
            modelBuilder
                .HasAnnotation("ProductVersion", "1.1.2")
                .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

            modelBuilder.Entity("WorkoutApplication.Domain.Exercises.ExecutedExercise", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<string>("CreatedBy");

                    b.Property<DateTime>("CreatedDateTime");

                    b.Property<int?>("ExecutedSetId");

                    b.Property<int?>("ExerciseId");

                    b.Property<string>("ModifiedBy");

                    b.Property<DateTime>("ModifiedDateTime");

                    b.Property<string>("Notes");

                    b.HasKey("Id");

                    b.HasIndex("ExecutedSetId");

                    b.HasIndex("ExerciseId");

                    b.ToTable("ExecutedExercises");
                });

            modelBuilder.Entity("WorkoutApplication.Domain.Exercises.Exercise", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<string>("CreatedBy");

                    b.Property<DateTime>("CreatedDateTime");

                    b.Property<string>("Description");

                    b.Property<string>("ModifiedBy");

                    b.Property<DateTime>("ModifiedDateTime");

                    b.Property<string>("Name");

                    b.Property<int?>("SetId");

                    b.HasKey("Id");

                    b.HasIndex("SetId");

                    b.ToTable("Exercises");
                });

            modelBuilder.Entity("WorkoutApplication.Domain.Exercises.ExerciseTargetAreaLink", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<string>("CreatedBy");

                    b.Property<DateTime>("CreatedDateTime");

                    b.Property<int>("ExerciseId");

                    b.Property<string>("ModifiedBy");

                    b.Property<DateTime>("ModifiedDateTime");

                    b.Property<int>("TargetAreaId");

                    b.HasKey("Id");

                    b.HasIndex("ExerciseId");

                    b.HasIndex("TargetAreaId");

                    b.ToTable("ExerciseTargetAreaLinks");
                });

            modelBuilder.Entity("WorkoutApplication.Domain.Exercises.TargetArea", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<string>("CreatedBy");

                    b.Property<DateTime>("CreatedDateTime");

                    b.Property<string>("ModifiedBy");

                    b.Property<DateTime>("ModifiedDateTime");

                    b.Property<string>("Name");

                    b.HasKey("Id");

                    b.ToTable("TargetAreas");
                });

            modelBuilder.Entity("WorkoutApplication.Domain.Resistances.Resistance", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<decimal>("Amount");

                    b.Property<string>("CreatedBy");

                    b.Property<DateTime>("CreatedDateTime");

                    b.Property<int?>("ExecutedExerciseId");

                    b.Property<string>("ModifiedBy");

                    b.Property<DateTime>("ModifiedDateTime");

                    b.HasKey("Id");

                    b.HasIndex("ExecutedExerciseId");

                    b.ToTable("Resistances");
                });

            modelBuilder.Entity("WorkoutApplication.Domain.Resistances.ResistanceBand", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<string>("Color");

                    b.Property<string>("CreatedBy");

                    b.Property<DateTime>("CreatedDateTime");

                    b.Property<string>("ModifiedBy");

                    b.Property<DateTime>("ModifiedDateTime");

                    b.Property<decimal>("Resistance");

                    b.HasKey("Id");

                    b.ToTable("ResistanceBands");
                });

            modelBuilder.Entity("WorkoutApplication.Domain.Sets.ExecutedSet", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<string>("CreatedBy");

                    b.Property<DateTime>("CreatedDateTime");

                    b.Property<string>("Discriminator")
                        .IsRequired();

                    b.Property<string>("ModifiedBy");

                    b.Property<DateTime>("ModifiedDateTime");

                    b.Property<int?>("SetId");

                    b.HasKey("Id");

                    b.HasIndex("SetId");

                    b.ToTable("ExecutedSets");

                    b.HasDiscriminator<string>("Discriminator").HasValue("ExecutedSet");
                });

            modelBuilder.Entity("WorkoutApplication.Domain.Sets.Set", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<string>("CreatedBy");

                    b.Property<DateTime>("CreatedDateTime");

                    b.Property<string>("Discriminator")
                        .IsRequired();

                    b.Property<string>("ModifiedBy");

                    b.Property<DateTime>("ModifiedDateTime");

                    b.Property<int?>("WorkoutId");

                    b.HasKey("Id");

                    b.HasIndex("WorkoutId");

                    b.ToTable("Sets");

                    b.HasDiscriminator<string>("Discriminator").HasValue("Set");
                });

            modelBuilder.Entity("WorkoutApplication.Domain.Workouts.ExecutedWorkout", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<string>("CreatedBy");

                    b.Property<DateTime>("CreatedDateTime");

                    b.Property<DateTime>("EndDateTime");

                    b.Property<string>("Journal");

                    b.Property<string>("ModifiedBy");

                    b.Property<DateTime>("ModifiedDateTime");

                    b.Property<int>("Rating");

                    b.Property<DateTime>("StartDateTime");

                    b.Property<int?>("WorkoutId");

                    b.HasKey("Id");

                    b.HasIndex("WorkoutId");

                    b.ToTable("ExecutedWorkouts");
                });

            modelBuilder.Entity("WorkoutApplication.Domain.Workouts.Workout", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<string>("CreatedBy");

                    b.Property<DateTime>("CreatedDateTime");

                    b.Property<string>("ModifiedBy");

                    b.Property<DateTime>("ModifiedDateTime");

                    b.Property<string>("Name");

                    b.Property<int>("UserId");

                    b.HasKey("Id");

                    b.ToTable("Workouts");
                });

            modelBuilder.Entity("WorkoutApplication.Domain.Sets.ExecutedRepetitionSet", b =>
                {
                    b.HasBaseType("WorkoutApplication.Domain.Sets.ExecutedSet");

                    b.Property<int>("ExecutedRepCount");

                    b.ToTable("ExecutedRepetitionSet");

                    b.HasDiscriminator().HasValue("ExecutedRepetitionSet");
                });

            modelBuilder.Entity("WorkoutApplication.Domain.Sets.ExecutedTimedSet", b =>
                {
                    b.HasBaseType("WorkoutApplication.Domain.Sets.ExecutedSet");

                    b.Property<TimeSpan>("ExecutedTime");

                    b.ToTable("ExecutedTimedSet");

                    b.HasDiscriminator().HasValue("ExecutedTimedSet");
                });

            modelBuilder.Entity("WorkoutApplication.Domain.Sets.RepetitionSet", b =>
                {
                    b.HasBaseType("WorkoutApplication.Domain.Sets.Set");

                    b.Property<int>("TargetRepCount");

                    b.ToTable("RepetitionSet");

                    b.HasDiscriminator().HasValue("RepetitionSet");
                });

            modelBuilder.Entity("WorkoutApplication.Domain.Sets.TimedSet", b =>
                {
                    b.HasBaseType("WorkoutApplication.Domain.Sets.Set");

                    b.Property<TimeSpan>("TargetTime");

                    b.ToTable("TimedSet");

                    b.HasDiscriminator().HasValue("TimedSet");
                });

            modelBuilder.Entity("WorkoutApplication.Domain.Exercises.ExecutedExercise", b =>
                {
                    b.HasOne("WorkoutApplication.Domain.Sets.ExecutedSet")
                        .WithMany("ExecutedExercises")
                        .HasForeignKey("ExecutedSetId");

                    b.HasOne("WorkoutApplication.Domain.Exercises.Exercise", "Exercise")
                        .WithMany()
                        .HasForeignKey("ExerciseId");
                });

            modelBuilder.Entity("WorkoutApplication.Domain.Exercises.Exercise", b =>
                {
                    b.HasOne("WorkoutApplication.Domain.Sets.Set")
                        .WithMany("Exercises")
                        .HasForeignKey("SetId");
                });

            modelBuilder.Entity("WorkoutApplication.Domain.Exercises.ExerciseTargetAreaLink", b =>
                {
                    b.HasOne("WorkoutApplication.Domain.Exercises.Exercise", "Exercise")
                        .WithMany("ExerciseTargetAreaLinks")
                        .HasForeignKey("ExerciseId")
                        .OnDelete(DeleteBehavior.Cascade);

                    b.HasOne("WorkoutApplication.Domain.Exercises.TargetArea", "TargetArea")
                        .WithMany("ExerciseTargetAreaLinks")
                        .HasForeignKey("TargetAreaId")
                        .OnDelete(DeleteBehavior.Cascade);
                });

            modelBuilder.Entity("WorkoutApplication.Domain.Resistances.Resistance", b =>
                {
                    b.HasOne("WorkoutApplication.Domain.Exercises.ExecutedExercise")
                        .WithMany("Resistances")
                        .HasForeignKey("ExecutedExerciseId");
                });

            modelBuilder.Entity("WorkoutApplication.Domain.Sets.ExecutedSet", b =>
                {
                    b.HasOne("WorkoutApplication.Domain.Sets.Set", "Set")
                        .WithMany()
                        .HasForeignKey("SetId");
                });

            modelBuilder.Entity("WorkoutApplication.Domain.Sets.Set", b =>
                {
                    b.HasOne("WorkoutApplication.Domain.Workouts.Workout")
                        .WithMany("Sets")
                        .HasForeignKey("WorkoutId");
                });

            modelBuilder.Entity("WorkoutApplication.Domain.Workouts.ExecutedWorkout", b =>
                {
                    b.HasOne("WorkoutApplication.Domain.Workouts.Workout", "Workout")
                        .WithMany()
                        .HasForeignKey("WorkoutId");
                });
        }
    }
}
