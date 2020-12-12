﻿// <auto-generated />
using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using WorkoutApplication.Data;

namespace WorkoutApplication.Data.Migrations
{
    [DbContext(typeof(WorkoutsContext))]
    [Migration("20201128151242_ResistanceBandUpdate")]
    partial class ResistanceBandUpdate
    {
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "3.1.8")
                .HasAnnotation("Relational:MaxIdentifierLength", 128)
                .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

            modelBuilder.Entity("WorkoutApplication.Domain.Exercises.ExecutedExercise", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<int>("ActualRepCount")
                        .HasColumnType("int");

                    b.Property<int>("CreatedByUserId")
                        .HasColumnType("int");

                    b.Property<DateTime>("CreatedDateTime")
                        .HasColumnType("datetime2");

                    b.Property<int?>("ExecutedWorkoutId")
                        .HasColumnType("int");

                    b.Property<int?>("ExerciseId")
                        .HasColumnType("int");

                    b.Property<int?>("ModifiedByUserId")
                        .HasColumnType("int");

                    b.Property<DateTime?>("ModifiedDateTime")
                        .HasColumnType("datetime2");

                    b.Property<string>("Notes")
                        .HasColumnType("nvarchar(max)")
                        .HasMaxLength(4096);

                    b.Property<decimal>("ResistanceAmount")
                        .HasColumnType("decimal(18,2)");

                    b.Property<string>("ResistanceMakeup")
                        .HasColumnType("nvarchar(max)");

                    b.Property<int>("Sequence")
                        .HasColumnType("int");

                    b.Property<int>("TargetRepCount")
                        .HasColumnType("int");

                    b.HasKey("Id");

                    b.HasIndex("ExecutedWorkoutId");

                    b.HasIndex("ExerciseId");

                    b.HasIndex("Sequence");

                    b.HasIndex("CreatedByUserId", "CreatedDateTime", "ModifiedByUserId", "ModifiedDateTime");

                    b.ToTable("ExecutedExercises");
                });

            modelBuilder.Entity("WorkoutApplication.Domain.Exercises.Exercise", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<int>("CreatedByUserId")
                        .HasColumnType("int");

                    b.Property<DateTime>("CreatedDateTime")
                        .HasColumnType("datetime2");

                    b.Property<string>("Description")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)")
                        .HasMaxLength(4096);

                    b.Property<int?>("ModifiedByUserId")
                        .HasColumnType("int");

                    b.Property<DateTime?>("ModifiedDateTime")
                        .HasColumnType("datetime2");

                    b.Property<string>("Movement")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)")
                        .HasMaxLength(4096);

                    b.Property<string>("Name")
                        .HasColumnType("nvarchar(450)");

                    b.Property<bool>("OneSided")
                        .HasColumnType("bit");

                    b.Property<string>("PointsToRemember")
                        .HasColumnType("nvarchar(max)")
                        .HasMaxLength(4096);

                    b.Property<string>("Setup")
                        .HasColumnType("nvarchar(max)")
                        .HasMaxLength(4096);

                    b.Property<int>("ResistanceType")
                        .HasColumnType("int");

                    b.HasKey("Id");

                    b.HasIndex("Name");

                    b.HasIndex("CreatedByUserId", "CreatedDateTime", "ModifiedByUserId", "ModifiedDateTime");

                    b.ToTable("Exercises");
                });

            modelBuilder.Entity("WorkoutApplication.Domain.Exercises.ExerciseInWorkout", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<int>("CreatedByUserId")
                        .HasColumnType("int");

                    b.Property<DateTime>("CreatedDateTime")
                        .HasColumnType("datetime2");

                    b.Property<int>("ExerciseId")
                        .HasColumnType("int");

                    b.Property<int?>("ModifiedByUserId")
                        .HasColumnType("int");

                    b.Property<DateTime?>("ModifiedDateTime")
                        .HasColumnType("datetime2");

                    b.Property<short>("NumberOfSets")
                        .HasColumnType("smallint");

                    b.Property<short>("Sequence")
                        .HasColumnType("smallint");

                    b.Property<int>("SetType")
                        .HasColumnType("int");

                    b.Property<int?>("WorkoutId")
                        .HasColumnType("int");

                    b.HasKey("Id");

                    b.HasIndex("ExerciseId");

                    b.HasIndex("WorkoutId");

                    b.ToTable("ExerciseInWorkout");
                });

            modelBuilder.Entity("WorkoutApplication.Domain.Exercises.ExerciseTargetAreaLink", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<int>("CreatedByUserId")
                        .HasColumnType("int");

                    b.Property<DateTime>("CreatedDateTime")
                        .HasColumnType("datetime2");

                    b.Property<int>("ExerciseId")
                        .HasColumnType("int");

                    b.Property<int?>("ModifiedByUserId")
                        .HasColumnType("int");

                    b.Property<DateTime?>("ModifiedDateTime")
                        .HasColumnType("datetime2");

                    b.Property<int>("TargetAreaId")
                        .HasColumnType("int");

                    b.HasKey("Id");

                    b.HasIndex("ExerciseId");

                    b.HasIndex("TargetAreaId");

                    b.ToTable("ExerciseTargetAreaLinks");
                });

            modelBuilder.Entity("WorkoutApplication.Domain.Exercises.TargetArea", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<int>("CreatedByUserId")
                        .HasColumnType("int");

                    b.Property<DateTime>("CreatedDateTime")
                        .HasColumnType("datetime2");

                    b.Property<int?>("ModifiedByUserId")
                        .HasColumnType("int");

                    b.Property<DateTime?>("ModifiedDateTime")
                        .HasColumnType("datetime2");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("nvarchar(40)")
                        .HasMaxLength(40);

                    b.HasKey("Id");

                    b.HasIndex("Name");

                    b.HasIndex("CreatedByUserId", "CreatedDateTime", "ModifiedByUserId", "ModifiedDateTime");

                    b.ToTable("TargetAreas");
                });

            modelBuilder.Entity("WorkoutApplication.Domain.Resistances.Resistance", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<decimal>("Amount")
                        .HasColumnType("decimal(18,2)");

                    b.Property<int>("CreatedByUserId")
                        .HasColumnType("int");

                    b.Property<DateTime>("CreatedDateTime")
                        .HasColumnType("datetime2");

                    b.Property<string>("Discriminator")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<int?>("ExecutedExerciseId")
                        .HasColumnType("int");

                    b.Property<int?>("ModifiedByUserId")
                        .HasColumnType("int");

                    b.Property<DateTime?>("ModifiedDateTime")
                        .HasColumnType("datetime2");

                    b.HasKey("Id");

                    b.HasIndex("ExecutedExerciseId");

                    b.HasIndex("CreatedByUserId", "CreatedDateTime", "ModifiedByUserId", "ModifiedDateTime");

                    b.ToTable("Resistances");

                    b.HasDiscriminator<string>("Discriminator").HasValue("Resistance");
                });

            modelBuilder.Entity("WorkoutApplication.Domain.Resistances.ResistanceBand", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<string>("Color")
                        .IsRequired()
                        .HasColumnType("nvarchar(25)")
                        .HasMaxLength(25);

                    b.Property<int>("CreatedByUserId")
                        .HasColumnType("int");

                    b.Property<DateTime>("CreatedDateTime")
                        .HasColumnType("datetime2");

                    b.Property<decimal>("MaxResistanceAmount")
                        .HasColumnType("decimal(18,2)");

                    b.Property<int?>("ModifiedByUserId")
                        .HasColumnType("int");

                    b.Property<DateTime?>("ModifiedDateTime")
                        .HasColumnType("datetime2");

                    b.Property<short>("NumberAvailable")
                        .HasColumnType("smallint");

                    b.HasKey("Id");

                    b.HasIndex("Color");

                    b.HasIndex("CreatedByUserId", "CreatedDateTime", "ModifiedByUserId", "ModifiedDateTime");

                    b.ToTable("ResistanceBands");
                });

            modelBuilder.Entity("WorkoutApplication.Domain.Sets.ExecutedSet", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<int>("CreatedByUserId")
                        .HasColumnType("int");

                    b.Property<DateTime>("CreatedDateTime")
                        .HasColumnType("datetime2");

                    b.Property<string>("Discriminator")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<int?>("ExecutedExerciseId")
                        .HasColumnType("int");

                    b.Property<int?>("ModifiedByUserId")
                        .HasColumnType("int");

                    b.Property<DateTime?>("ModifiedDateTime")
                        .HasColumnType("datetime2");

                    b.Property<int?>("SetId")
                        .HasColumnType("int");

                    b.HasKey("Id");

                    b.HasIndex("ExecutedExerciseId");

                    b.HasIndex("SetId");

                    b.HasIndex("CreatedByUserId", "CreatedDateTime", "ModifiedByUserId", "ModifiedDateTime");

                    b.ToTable("ExecutedSets");

                    b.HasDiscriminator<string>("Discriminator").HasValue("ExecutedSet");
                });

            modelBuilder.Entity("WorkoutApplication.Domain.Sets.Set", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<int>("CreatedByUserId")
                        .HasColumnType("int");

                    b.Property<DateTime>("CreatedDateTime")
                        .HasColumnType("datetime2");

                    b.Property<string>("Discriminator")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<int?>("ExerciseId")
                        .HasColumnType("int");

                    b.Property<int?>("ModifiedByUserId")
                        .HasColumnType("int");

                    b.Property<DateTime?>("ModifiedDateTime")
                        .HasColumnType("datetime2");

                    b.Property<short>("Sequence")
                        .HasColumnType("smallint");

                    b.HasKey("Id");

                    b.HasIndex("ExerciseId");

                    b.HasIndex("CreatedByUserId", "CreatedDateTime", "ModifiedByUserId", "ModifiedDateTime");

                    b.ToTable("Sets");

                    b.HasDiscriminator<string>("Discriminator").HasValue("Set");
                });

            modelBuilder.Entity("WorkoutApplication.Domain.User", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<int>("CreatedByUserId")
                        .HasColumnType("int");

                    b.Property<DateTime>("CreatedDateTime")
                        .HasColumnType("datetime2");

                    b.Property<string>("HashedPassword")
                        .HasColumnType("nvarchar(1024)")
                        .HasMaxLength(1024);

                    b.Property<int?>("ModifiedByUserId")
                        .HasColumnType("int");

                    b.Property<DateTime?>("ModifiedDateTime")
                        .HasColumnType("datetime2");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("nvarchar(50)")
                        .HasMaxLength(50);

                    b.Property<string>("ProfilePic")
                        .HasColumnType("nvarchar(max)")
                        .HasMaxLength(4096);

                    b.HasKey("Id");

                    b.HasIndex("Name");

                    b.HasIndex("CreatedByUserId", "CreatedDateTime", "ModifiedByUserId", "ModifiedDateTime");

                    b.ToTable("Users");
                });

            modelBuilder.Entity("WorkoutApplication.Domain.Workouts.ExecutedWorkout", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<int>("CreatedByUserId")
                        .HasColumnType("int");

                    b.Property<DateTime>("CreatedDateTime")
                        .HasColumnType("datetime2");

                    b.Property<DateTime>("EndDateTime")
                        .HasColumnType("datetime2");

                    b.Property<string>("Journal")
                        .HasColumnType("nvarchar(max)");

                    b.Property<int?>("ModifiedByUserId")
                        .HasColumnType("int");

                    b.Property<DateTime?>("ModifiedDateTime")
                        .HasColumnType("datetime2");

                    b.Property<int>("Rating")
                        .HasColumnType("int");

                    b.Property<DateTime>("StartDateTime")
                        .HasColumnType("datetime2");

                    b.Property<int?>("WorkoutId")
                        .HasColumnType("int");

                    b.HasKey("Id");

                    b.HasIndex("WorkoutId");

                    b.ToTable("ExecutedWorkouts");
                });

            modelBuilder.Entity("WorkoutApplication.Domain.Workouts.Workout", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

                    b.Property<int>("CreatedByUserId")
                        .HasColumnType("int");

                    b.Property<DateTime>("CreatedDateTime")
                        .HasColumnType("datetime2");

                    b.Property<int?>("ModifiedByUserId")
                        .HasColumnType("int");

                    b.Property<DateTime?>("ModifiedDateTime")
                        .HasColumnType("datetime2");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("nvarchar(50)")
                        .HasMaxLength(50);

                    b.Property<int>("UserId")
                        .HasColumnType("int");

                    b.HasKey("Id");

                    b.HasIndex("CreatedByUserId", "CreatedDateTime", "ModifiedByUserId", "ModifiedDateTime");

                    b.ToTable("Workouts");
                });

            modelBuilder.Entity("WorkoutApplication.Domain.Resistances.BandResistance", b =>
                {
                    b.HasBaseType("WorkoutApplication.Domain.Resistances.Resistance");

                    b.Property<string>("Color")
                        .IsRequired()
                        .HasColumnType("nvarchar(25)")
                        .HasMaxLength(25);

                    b.HasIndex("Amount");

                    b.HasIndex("Color");

                    b.HasDiscriminator().HasValue("BandResistance");
                });

            modelBuilder.Entity("WorkoutApplication.Domain.Sets.ExecutedRepetitionSet", b =>
                {
                    b.HasBaseType("WorkoutApplication.Domain.Sets.ExecutedSet");

                    b.Property<int>("ExecutedRepCount")
                        .HasColumnType("int");

                    b.HasDiscriminator().HasValue("ExecutedRepetitionSet");
                });

            modelBuilder.Entity("WorkoutApplication.Domain.Sets.ExecutedTimedSet", b =>
                {
                    b.HasBaseType("WorkoutApplication.Domain.Sets.ExecutedSet");

                    b.Property<TimeSpan>("ExecutedTime")
                        .HasColumnType("time");

                    b.HasDiscriminator().HasValue("ExecutedTimedSet");
                });

            modelBuilder.Entity("WorkoutApplication.Domain.Sets.RepetitionSet", b =>
                {
                    b.HasBaseType("WorkoutApplication.Domain.Sets.Set");

                    b.Property<int>("TargetRepCount")
                        .HasColumnType("int");

                    b.HasDiscriminator().HasValue("RepetitionSet");
                });

            modelBuilder.Entity("WorkoutApplication.Domain.Sets.TimedSet", b =>
                {
                    b.HasBaseType("WorkoutApplication.Domain.Sets.Set");

                    b.Property<TimeSpan>("TargetTime")
                        .HasColumnType("time");

                    b.HasDiscriminator().HasValue("TimedSet");
                });

            modelBuilder.Entity("WorkoutApplication.Domain.Exercises.ExecutedExercise", b =>
                {
                    b.HasOne("WorkoutApplication.Domain.Workouts.ExecutedWorkout", null)
                        .WithMany("Exercises")
                        .HasForeignKey("ExecutedWorkoutId");

                    b.HasOne("WorkoutApplication.Domain.Exercises.Exercise", "Exercise")
                        .WithMany()
                        .HasForeignKey("ExerciseId");
                });

            modelBuilder.Entity("WorkoutApplication.Domain.Exercises.ExerciseInWorkout", b =>
                {
                    b.HasOne("WorkoutApplication.Domain.Exercises.Exercise", "Exercise")
                        .WithMany()
                        .HasForeignKey("ExerciseId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("WorkoutApplication.Domain.Workouts.Workout", null)
                        .WithMany("Exercises")
                        .HasForeignKey("WorkoutId");
                });

            modelBuilder.Entity("WorkoutApplication.Domain.Exercises.ExerciseTargetAreaLink", b =>
                {
                    b.HasOne("WorkoutApplication.Domain.Exercises.Exercise", "Exercise")
                        .WithMany("ExerciseTargetAreaLinks")
                        .HasForeignKey("ExerciseId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("WorkoutApplication.Domain.Exercises.TargetArea", "TargetArea")
                        .WithMany()
                        .HasForeignKey("TargetAreaId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
                });

            modelBuilder.Entity("WorkoutApplication.Domain.Resistances.Resistance", b =>
                {
                    b.HasOne("WorkoutApplication.Domain.Exercises.ExecutedExercise", null)
                        .WithMany("Resistances")
                        .HasForeignKey("ExecutedExerciseId");
                });

            modelBuilder.Entity("WorkoutApplication.Domain.Sets.ExecutedSet", b =>
                {
                    b.HasOne("WorkoutApplication.Domain.Exercises.ExecutedExercise", "ExecutedExercise")
                        .WithMany()
                        .HasForeignKey("ExecutedExerciseId");

                    b.HasOne("WorkoutApplication.Domain.Sets.Set", "Set")
                        .WithMany()
                        .HasForeignKey("SetId");
                });

            modelBuilder.Entity("WorkoutApplication.Domain.Sets.Set", b =>
                {
                    b.HasOne("WorkoutApplication.Domain.Exercises.Exercise", "Exercise")
                        .WithMany()
                        .HasForeignKey("ExerciseId");
                });

            modelBuilder.Entity("WorkoutApplication.Domain.Workouts.ExecutedWorkout", b =>
                {
                    b.HasOne("WorkoutApplication.Domain.Workouts.Workout", "Workout")
                        .WithMany()
                        .HasForeignKey("WorkoutId");
                });
#pragma warning restore 612, 618
        }
    }
}
