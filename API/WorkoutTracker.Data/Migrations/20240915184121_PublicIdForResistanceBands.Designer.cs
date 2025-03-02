﻿// <auto-generated />
using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using WorkoutTracker.Data;

#nullable disable

namespace WorkoutTracker.Data.Migrations
{
    [DbContext(typeof(WorkoutsContext))]
    [Migration("20240915184121_PublicIdForResistanceBands")]
    partial class PublicIdForResistanceBands
    {
        /// <inheritdoc />
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "8.0.0")
                .HasAnnotation("Proxies:ChangeTracking", false)
                .HasAnnotation("Proxies:CheckEquality", false)
                .HasAnnotation("Proxies:LazyLoading", true)
                .HasAnnotation("Relational:MaxIdentifierLength", 128);

            SqlServerModelBuilderExtensions.UseIdentityColumns(modelBuilder);

            modelBuilder.Entity("WorkoutTracker.Domain.Exercises.ExecutedExercise", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("Id"));

                    b.Property<byte>("ActualRepCount")
                        .HasColumnType("tinyint");

                    b.Property<int>("CreatedByUserId")
                        .HasColumnType("int");

                    b.Property<DateTime>("CreatedDateTime")
                        .HasColumnType("datetime2");

                    b.Property<int?>("Duration")
                        .HasColumnType("int");

                    b.Property<int>("ExecutedWorkoutId")
                        .HasColumnType("int");

                    b.Property<int>("ExerciseId")
                        .HasColumnType("int");

                    b.Property<byte>("FormRating")
                        .HasColumnType("tinyint");

                    b.Property<int?>("ModifiedByUserId")
                        .HasColumnType("int");

                    b.Property<DateTime?>("ModifiedDateTime")
                        .HasColumnType("datetime2");

                    b.Property<string>("Notes")
                        .HasMaxLength(4096)
                        .HasColumnType("nvarchar(max)");

                    b.Property<byte>("RangeOfMotionRating")
                        .HasColumnType("tinyint");

                    b.Property<decimal>("ResistanceAmount")
                        .HasColumnType("decimal(18,2)");

                    b.Property<string>("ResistanceMakeup")
                        .HasColumnType("nvarchar(max)");

                    b.Property<byte>("Sequence")
                        .HasColumnType("tinyint");

                    b.Property<int>("SetType")
                        .HasColumnType("int");

                    b.Property<int?>("Side")
                        .HasColumnType("int");

                    b.Property<byte>("TargetRepCount")
                        .HasColumnType("tinyint");

                    b.HasKey("Id");

                    b.HasIndex("ExecutedWorkoutId");

                    b.HasIndex("ExerciseId");

                    b.HasIndex("Sequence");

                    b.HasIndex("CreatedByUserId", "CreatedDateTime", "ModifiedByUserId", "ModifiedDateTime");

                    b.ToTable("ExecutedExercises");
                });

            modelBuilder.Entity("WorkoutTracker.Domain.Exercises.Exercise", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("Id"));

                    b.Property<bool?>("BandsEndToEnd")
                        .HasColumnType("bit");

                    b.Property<int>("CreatedByUserId")
                        .HasColumnType("int");

                    b.Property<DateTime>("CreatedDateTime")
                        .HasColumnType("datetime2");

                    b.Property<string>("Description")
                        .IsRequired()
                        .HasMaxLength(4096)
                        .HasColumnType("nvarchar(max)");

                    b.Property<bool>("InvolvesReps")
                        .HasColumnType("bit");

                    b.Property<int?>("ModifiedByUserId")
                        .HasColumnType("int");

                    b.Property<DateTime?>("ModifiedDateTime")
                        .HasColumnType("datetime2");

                    b.Property<string>("Movement")
                        .IsRequired()
                        .HasMaxLength(4096)
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("Name")
                        .HasColumnType("nvarchar(450)");

                    b.Property<bool>("OneSided")
                        .HasColumnType("bit");

                    b.Property<string>("PointsToRemember")
                        .HasMaxLength(4096)
                        .HasColumnType("nvarchar(max)");

                    b.Property<Guid>("PublicId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uniqueidentifier")
                        .HasDefaultValueSql("NEWID()");

                    b.Property<int>("ResistanceType")
                        .HasColumnType("int");

                    b.Property<string>("Setup")
                        .HasMaxLength(4096)
                        .HasColumnType("nvarchar(max)");

                    b.Property<bool>("UsesBilateralResistance")
                        .HasColumnType("bit");

                    b.HasKey("Id");

                    b.HasIndex("Name");

                    b.HasIndex("PublicId");

                    b.HasIndex("CreatedByUserId", "CreatedDateTime", "ModifiedByUserId", "ModifiedDateTime");

                    b.ToTable("Exercises");
                });

            modelBuilder.Entity("WorkoutTracker.Domain.Exercises.ExerciseInWorkout", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("Id"));

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

                    b.Property<byte>("NumberOfSets")
                        .HasColumnType("tinyint");

                    b.Property<byte>("Sequence")
                        .HasColumnType("tinyint");

                    b.Property<int>("SetType")
                        .HasColumnType("int");

                    b.Property<int?>("WorkoutId")
                        .HasColumnType("int");

                    b.HasKey("Id");

                    b.HasIndex("ExerciseId");

                    b.HasIndex("WorkoutId");

                    b.ToTable("ExerciseInWorkout");
                });

            modelBuilder.Entity("WorkoutTracker.Domain.Exercises.ExerciseTargetAreaLink", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("Id"));

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

            modelBuilder.Entity("WorkoutTracker.Domain.Exercises.TargetArea", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("Id"));

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
                        .HasMaxLength(40)
                        .HasColumnType("nvarchar(40)");

                    b.HasKey("Id");

                    b.HasIndex("Name");

                    b.HasIndex("CreatedByUserId", "CreatedDateTime", "ModifiedByUserId", "ModifiedDateTime");

                    b.ToTable("TargetAreas");
                });

            modelBuilder.Entity("WorkoutTracker.Domain.Resistances.Resistance", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("Id"));

                    b.Property<decimal>("Amount")
                        .HasColumnType("decimal(18,2)");

                    b.Property<int>("CreatedByUserId")
                        .HasColumnType("int");

                    b.Property<DateTime>("CreatedDateTime")
                        .HasColumnType("datetime2");

                    b.Property<string>("Discriminator")
                        .IsRequired()
                        .HasMaxLength(21)
                        .HasColumnType("nvarchar(21)");

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

                    b.UseTphMappingStrategy();
                });

            modelBuilder.Entity("WorkoutTracker.Domain.Resistances.ResistanceBand", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("Id"));

                    b.Property<string>("Color")
                        .IsRequired()
                        .HasMaxLength(25)
                        .HasColumnType("nvarchar(25)");

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

                    b.Property<Guid>("PublicId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uniqueidentifier")
                        .HasDefaultValueSql("NEWID()");

                    b.HasKey("Id");

                    b.HasIndex("Color");

                    b.HasIndex("CreatedByUserId", "CreatedDateTime", "ModifiedByUserId", "ModifiedDateTime");

                    b.ToTable("ResistanceBands");
                });

            modelBuilder.Entity("WorkoutTracker.Domain.Sets.ExecutedSet", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("Id"));

                    b.Property<int>("CreatedByUserId")
                        .HasColumnType("int");

                    b.Property<DateTime>("CreatedDateTime")
                        .HasColumnType("datetime2");

                    b.Property<string>("Discriminator")
                        .IsRequired()
                        .HasMaxLength(21)
                        .HasColumnType("nvarchar(21)");

                    b.Property<int?>("ExecutedExerciseId")
                        .HasColumnType("int");

                    b.Property<int?>("ModifiedByUserId")
                        .HasColumnType("int");

                    b.Property<DateTime?>("ModifiedDateTime")
                        .HasColumnType("datetime2");

                    b.HasKey("Id");

                    b.HasIndex("ExecutedExerciseId");

                    b.HasIndex("CreatedByUserId", "CreatedDateTime", "ModifiedByUserId", "ModifiedDateTime");

                    b.ToTable("ExecutedSets");

                    b.HasDiscriminator<string>("Discriminator").HasValue("ExecutedSet");

                    b.UseTphMappingStrategy();
                });

            modelBuilder.Entity("WorkoutTracker.Domain.Users.User", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("Id"));

                    b.Property<int>("CreatedByUserId")
                        .HasColumnType("int");

                    b.Property<DateTime>("CreatedDateTime")
                        .HasColumnType("datetime2");

                    b.Property<string>("EmailAddress")
                        .IsRequired()
                        .ValueGeneratedOnAdd()
                        .HasColumnType("nvarchar(450)")
                        .HasDefaultValue("noemail@noemail.com");

                    b.Property<string>("HashedPassword")
                        .HasMaxLength(1024)
                        .HasColumnType("nvarchar(1024)");

                    b.Property<int?>("ModifiedByUserId")
                        .HasColumnType("int");

                    b.Property<DateTime?>("ModifiedDateTime")
                        .HasColumnType("datetime2");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasMaxLength(50)
                        .HasColumnType("nvarchar(50)");

                    b.Property<string>("PasswordResetCode")
                        .HasMaxLength(25)
                        .HasColumnType("nvarchar(25)");

                    b.Property<string>("ProfilePic")
                        .HasMaxLength(4096)
                        .HasColumnType("nvarchar(max)");

                    b.Property<Guid>("PublicId")
                        .HasColumnType("uniqueidentifier");

                    b.Property<int>("Role")
                        .HasColumnType("int");

                    b.Property<string>("Salt")
                        .HasMaxLength(50)
                        .HasColumnType("nvarchar(50)");

                    b.HasKey("Id");

                    b.HasIndex("EmailAddress");

                    b.HasIndex("Name");

                    b.HasIndex("CreatedByUserId", "CreatedDateTime", "ModifiedByUserId", "ModifiedDateTime");

                    b.ToTable("Users");
                });

            modelBuilder.Entity("WorkoutTracker.Domain.Users.UserMinMaxReps", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("Id"));

                    b.Property<int>("CreatedByUserId")
                        .HasColumnType("int");

                    b.Property<DateTime>("CreatedDateTime")
                        .HasColumnType("datetime2");

                    b.Property<int?>("Duration")
                        .HasColumnType("int");

                    b.Property<byte>("MaxReps")
                        .HasColumnType("tinyint");

                    b.Property<byte>("MinReps")
                        .HasColumnType("tinyint");

                    b.Property<int?>("ModifiedByUserId")
                        .HasColumnType("int");

                    b.Property<DateTime?>("ModifiedDateTime")
                        .HasColumnType("datetime2");

                    b.Property<int>("SetType")
                        .HasColumnType("int");

                    b.Property<int>("UserSettingsId")
                        .HasColumnType("int");

                    b.HasKey("Id");

                    b.HasIndex("UserSettingsId");

                    b.ToTable("UserMinMaxReps");
                });

            modelBuilder.Entity("WorkoutTracker.Domain.Users.UserSettings", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("Id"));

                    b.Property<int>("CreatedByUserId")
                        .HasColumnType("int");

                    b.Property<DateTime>("CreatedDateTime")
                        .HasColumnType("datetime2");

                    b.Property<byte>("LowestAcceptableRating")
                        .HasColumnType("tinyint");

                    b.Property<int?>("ModifiedByUserId")
                        .HasColumnType("int");

                    b.Property<DateTime?>("ModifiedDateTime")
                        .HasColumnType("datetime2");

                    b.Property<bool>("RecommendationsEnabled")
                        .HasColumnType("bit");

                    b.Property<int>("UserId")
                        .HasColumnType("int");

                    b.HasKey("Id");

                    b.HasIndex("UserId")
                        .IsUnique();

                    b.ToTable("UserSettings");
                });

            modelBuilder.Entity("WorkoutTracker.Domain.Workouts.ExecutedWorkout", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("Id"));

                    b.Property<int>("CreatedByUserId")
                        .HasColumnType("int");

                    b.Property<DateTime>("CreatedDateTime")
                        .HasColumnType("datetime2");

                    b.Property<DateTime?>("EndDateTime")
                        .HasColumnType("datetime2");

                    b.Property<string>("Journal")
                        .HasColumnType("nvarchar(max)");

                    b.Property<int?>("ModifiedByUserId")
                        .HasColumnType("int");

                    b.Property<DateTime?>("ModifiedDateTime")
                        .HasColumnType("datetime2");

                    b.Property<Guid>("PublicId")
                        .HasColumnType("uniqueidentifier");

                    b.Property<int>("Rating")
                        .HasColumnType("int");

                    b.Property<DateTime?>("StartDateTime")
                        .HasColumnType("datetime2");

                    b.Property<int>("WorkoutId")
                        .HasColumnType("int");

                    b.HasKey("Id");

                    b.HasIndex("WorkoutId");

                    b.ToTable("ExecutedWorkouts");
                });

            modelBuilder.Entity("WorkoutTracker.Domain.Workouts.Workout", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("Id"));

                    b.Property<bool>("Active")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bit")
                        .HasDefaultValue(true);

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
                        .HasMaxLength(50)
                        .HasColumnType("nvarchar(50)");

                    b.Property<Guid>("PublicId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uniqueidentifier")
                        .HasDefaultValueSql("NEWID()");

                    b.HasKey("Id");

                    b.HasIndex("PublicId");

                    b.HasIndex("CreatedByUserId", "CreatedDateTime", "ModifiedByUserId", "ModifiedDateTime");

                    b.ToTable("Workouts");
                });

            modelBuilder.Entity("WorkoutTracker.Domain.Resistances.BandResistance", b =>
                {
                    b.HasBaseType("WorkoutTracker.Domain.Resistances.Resistance");

                    b.Property<string>("Color")
                        .IsRequired()
                        .HasMaxLength(25)
                        .HasColumnType("nvarchar(25)");

                    b.HasIndex("Amount");

                    b.HasIndex("Color");

                    b.HasDiscriminator().HasValue("BandResistance");
                });

            modelBuilder.Entity("WorkoutTracker.Domain.Sets.ExecutedRepetitionSet", b =>
                {
                    b.HasBaseType("WorkoutTracker.Domain.Sets.ExecutedSet");

                    b.Property<int>("ExecutedRepCount")
                        .HasColumnType("int");

                    b.HasDiscriminator().HasValue("ExecutedRepetitionSet");
                });

            modelBuilder.Entity("WorkoutTracker.Domain.Sets.ExecutedTimedSet", b =>
                {
                    b.HasBaseType("WorkoutTracker.Domain.Sets.ExecutedSet");

                    b.Property<TimeSpan>("ExecutedTime")
                        .HasColumnType("time");

                    b.HasDiscriminator().HasValue("ExecutedTimedSet");
                });

            modelBuilder.Entity("WorkoutTracker.Domain.Exercises.ExecutedExercise", b =>
                {
                    b.HasOne("WorkoutTracker.Domain.Workouts.ExecutedWorkout", "ExecutedWorkout")
                        .WithMany("Exercises")
                        .HasForeignKey("ExecutedWorkoutId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("WorkoutTracker.Domain.Exercises.Exercise", "Exercise")
                        .WithMany()
                        .HasForeignKey("ExerciseId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("ExecutedWorkout");

                    b.Navigation("Exercise");
                });

            modelBuilder.Entity("WorkoutTracker.Domain.Exercises.ExerciseInWorkout", b =>
                {
                    b.HasOne("WorkoutTracker.Domain.Exercises.Exercise", "Exercise")
                        .WithMany()
                        .HasForeignKey("ExerciseId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("WorkoutTracker.Domain.Workouts.Workout", null)
                        .WithMany("Exercises")
                        .HasForeignKey("WorkoutId");

                    b.Navigation("Exercise");
                });

            modelBuilder.Entity("WorkoutTracker.Domain.Exercises.ExerciseTargetAreaLink", b =>
                {
                    b.HasOne("WorkoutTracker.Domain.Exercises.Exercise", "Exercise")
                        .WithMany("ExerciseTargetAreaLinks")
                        .HasForeignKey("ExerciseId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("WorkoutTracker.Domain.Exercises.TargetArea", "TargetArea")
                        .WithMany()
                        .HasForeignKey("TargetAreaId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Exercise");

                    b.Navigation("TargetArea");
                });

            modelBuilder.Entity("WorkoutTracker.Domain.Resistances.Resistance", b =>
                {
                    b.HasOne("WorkoutTracker.Domain.Exercises.ExecutedExercise", null)
                        .WithMany("Resistances")
                        .HasForeignKey("ExecutedExerciseId");
                });

            modelBuilder.Entity("WorkoutTracker.Domain.Sets.ExecutedSet", b =>
                {
                    b.HasOne("WorkoutTracker.Domain.Exercises.ExecutedExercise", "ExecutedExercise")
                        .WithMany()
                        .HasForeignKey("ExecutedExerciseId");

                    b.Navigation("ExecutedExercise");
                });

            modelBuilder.Entity("WorkoutTracker.Domain.Users.UserMinMaxReps", b =>
                {
                    b.HasOne("WorkoutTracker.Domain.Users.UserSettings", null)
                        .WithMany("RepSettings")
                        .HasForeignKey("UserSettingsId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
                });

            modelBuilder.Entity("WorkoutTracker.Domain.Users.UserSettings", b =>
                {
                    b.HasOne("WorkoutTracker.Domain.Users.User", null)
                        .WithOne("Settings")
                        .HasForeignKey("WorkoutTracker.Domain.Users.UserSettings", "UserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
                });

            modelBuilder.Entity("WorkoutTracker.Domain.Workouts.ExecutedWorkout", b =>
                {
                    b.HasOne("WorkoutTracker.Domain.Workouts.Workout", "Workout")
                        .WithMany()
                        .HasForeignKey("WorkoutId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Workout");
                });

            modelBuilder.Entity("WorkoutTracker.Domain.Exercises.ExecutedExercise", b =>
                {
                    b.Navigation("Resistances");
                });

            modelBuilder.Entity("WorkoutTracker.Domain.Exercises.Exercise", b =>
                {
                    b.Navigation("ExerciseTargetAreaLinks");
                });

            modelBuilder.Entity("WorkoutTracker.Domain.Users.User", b =>
                {
                    b.Navigation("Settings");
                });

            modelBuilder.Entity("WorkoutTracker.Domain.Users.UserSettings", b =>
                {
                    b.Navigation("RepSettings");
                });

            modelBuilder.Entity("WorkoutTracker.Domain.Workouts.ExecutedWorkout", b =>
                {
                    b.Navigation("Exercises");
                });

            modelBuilder.Entity("WorkoutTracker.Domain.Workouts.Workout", b =>
                {
                    b.Navigation("Exercises");
                });
#pragma warning restore 612, 618
        }
    }
}
