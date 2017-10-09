using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;
using System;
using System.Collections.Generic;

namespace WorkoutApplication.Data.Migrations
{
    public partial class InitialCreate : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Exercises",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    CreatedByUserId = table.Column<int>(type: "int", nullable: false),
                    CreatedDateTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", maxLength: 4096, nullable: false),
                    ModifiedByUserId = table.Column<int>(type: "int", nullable: true),
                    ModifiedDateTime = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Name = table.Column<string>(type: "nvarchar(450)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Exercises", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ResistanceBands",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    Color = table.Column<string>(type: "nvarchar(25)", maxLength: 25, nullable: false),
                    CreatedByUserId = table.Column<int>(type: "int", nullable: false),
                    CreatedDateTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ModifiedByUserId = table.Column<int>(type: "int", nullable: true),
                    ModifiedDateTime = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ResistanceAmount = table.Column<decimal>(type: "decimal(18, 2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ResistanceBands", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "TargetAreas",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    CreatedByUserId = table.Column<int>(type: "int", nullable: false),
                    CreatedDateTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ModifiedByUserId = table.Column<int>(type: "int", nullable: true),
                    ModifiedDateTime = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Name = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TargetAreas", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    CreatedByUserId = table.Column<int>(type: "int", nullable: false),
                    CreatedDateTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    HashedPassword = table.Column<string>(type: "nvarchar(1024)", maxLength: 1024, nullable: true),
                    ModifiedByUserId = table.Column<int>(type: "int", nullable: true),
                    ModifiedDateTime = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Name = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    ProfilePic = table.Column<string>(type: "nvarchar(max)", maxLength: 4096, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Workouts",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    CreatedByUserId = table.Column<int>(type: "int", nullable: false),
                    CreatedDateTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ModifiedByUserId = table.Column<int>(type: "int", nullable: true),
                    ModifiedDateTime = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Name = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    UserId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Workouts", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ExecutedExercises",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    CreatedByUserId = table.Column<int>(type: "int", nullable: false),
                    CreatedDateTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ExerciseId = table.Column<int>(type: "int", nullable: true),
                    ModifiedByUserId = table.Column<int>(type: "int", nullable: true),
                    ModifiedDateTime = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(max)", maxLength: 4096, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ExecutedExercises", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ExecutedExercises_Exercises_ExerciseId",
                        column: x => x.ExerciseId,
                        principalTable: "Exercises",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ExerciseTargetAreaLinks",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    CreatedByUserId = table.Column<int>(type: "int", nullable: false),
                    CreatedDateTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ExerciseId = table.Column<int>(type: "int", nullable: false),
                    ModifiedByUserId = table.Column<int>(type: "int", nullable: true),
                    ModifiedDateTime = table.Column<DateTime>(type: "datetime2", nullable: true),
                    TargetAreaId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ExerciseTargetAreaLinks", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ExerciseTargetAreaLinks_Exercises_ExerciseId",
                        column: x => x.ExerciseId,
                        principalTable: "Exercises",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ExerciseTargetAreaLinks_TargetAreas_TargetAreaId",
                        column: x => x.TargetAreaId,
                        principalTable: "TargetAreas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ExecutedWorkouts",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    CreatedByUserId = table.Column<int>(type: "int", nullable: false),
                    CreatedDateTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EndDateTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Journal = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ModifiedByUserId = table.Column<int>(type: "int", nullable: true),
                    ModifiedDateTime = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Rating = table.Column<int>(type: "int", nullable: false),
                    StartDateTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    WorkoutId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ExecutedWorkouts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ExecutedWorkouts_Workouts_WorkoutId",
                        column: x => x.WorkoutId,
                        principalTable: "Workouts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Sets",
                columns: table => new
                {
                    TargetRepCount = table.Column<int>(type: "int", nullable: true),
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    CreatedByUserId = table.Column<int>(type: "int", nullable: false),
                    CreatedDateTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Discriminator = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ExerciseId = table.Column<int>(type: "int", nullable: true),
                    ModifiedByUserId = table.Column<int>(type: "int", nullable: true),
                    ModifiedDateTime = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Sequence = table.Column<short>(type: "smallint", nullable: false),
                    WorkoutId = table.Column<int>(type: "int", nullable: true),
                    TargetTime = table.Column<TimeSpan>(type: "time", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Sets", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Sets_Exercises_ExerciseId",
                        column: x => x.ExerciseId,
                        principalTable: "Exercises",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Sets_Workouts_WorkoutId",
                        column: x => x.WorkoutId,
                        principalTable: "Workouts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Resistances",
                columns: table => new
                {
                    Color = table.Column<string>(type: "nvarchar(25)", maxLength: 25, nullable: true),
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    Amount = table.Column<decimal>(type: "decimal(18, 2)", nullable: false),
                    CreatedByUserId = table.Column<int>(type: "int", nullable: false),
                    CreatedDateTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Discriminator = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ExecutedExerciseId = table.Column<int>(type: "int", nullable: true),
                    ModifiedByUserId = table.Column<int>(type: "int", nullable: true),
                    ModifiedDateTime = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Resistances", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Resistances_ExecutedExercises_ExecutedExerciseId",
                        column: x => x.ExecutedExerciseId,
                        principalTable: "ExecutedExercises",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ExecutedSets",
                columns: table => new
                {
                    ExecutedRepCount = table.Column<int>(type: "int", nullable: true),
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    CreatedByUserId = table.Column<int>(type: "int", nullable: false),
                    CreatedDateTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Discriminator = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ExecutedExerciseId = table.Column<int>(type: "int", nullable: true),
                    ModifiedByUserId = table.Column<int>(type: "int", nullable: true),
                    ModifiedDateTime = table.Column<DateTime>(type: "datetime2", nullable: true),
                    SetId = table.Column<int>(type: "int", nullable: true),
                    ExecutedTime = table.Column<TimeSpan>(type: "time", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ExecutedSets", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ExecutedSets_ExecutedExercises_ExecutedExerciseId",
                        column: x => x.ExecutedExerciseId,
                        principalTable: "ExecutedExercises",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ExecutedSets_Sets_SetId",
                        column: x => x.SetId,
                        principalTable: "Sets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ExecutedExercises_ExerciseId",
                table: "ExecutedExercises",
                column: "ExerciseId");

            migrationBuilder.CreateIndex(
                name: "IX_ExecutedExercises_CreatedByUserId_CreatedDateTime_ModifiedByUserId_ModifiedDateTime",
                table: "ExecutedExercises",
                columns: new[] { "CreatedByUserId", "CreatedDateTime", "ModifiedByUserId", "ModifiedDateTime" });

            migrationBuilder.CreateIndex(
                name: "IX_ExecutedSets_ExecutedExerciseId",
                table: "ExecutedSets",
                column: "ExecutedExerciseId");

            migrationBuilder.CreateIndex(
                name: "IX_ExecutedSets_SetId",
                table: "ExecutedSets",
                column: "SetId");

            migrationBuilder.CreateIndex(
                name: "IX_ExecutedSets_CreatedByUserId_CreatedDateTime_ModifiedByUserId_ModifiedDateTime",
                table: "ExecutedSets",
                columns: new[] { "CreatedByUserId", "CreatedDateTime", "ModifiedByUserId", "ModifiedDateTime" });

            migrationBuilder.CreateIndex(
                name: "IX_ExecutedWorkouts_WorkoutId",
                table: "ExecutedWorkouts",
                column: "WorkoutId");

            migrationBuilder.CreateIndex(
                name: "IX_Exercises_Name",
                table: "Exercises",
                column: "Name");

            migrationBuilder.CreateIndex(
                name: "IX_Exercises_CreatedByUserId_CreatedDateTime_ModifiedByUserId_ModifiedDateTime",
                table: "Exercises",
                columns: new[] { "CreatedByUserId", "CreatedDateTime", "ModifiedByUserId", "ModifiedDateTime" });

            migrationBuilder.CreateIndex(
                name: "IX_ExerciseTargetAreaLinks_ExerciseId",
                table: "ExerciseTargetAreaLinks",
                column: "ExerciseId");

            migrationBuilder.CreateIndex(
                name: "IX_ExerciseTargetAreaLinks_TargetAreaId",
                table: "ExerciseTargetAreaLinks",
                column: "TargetAreaId");

            migrationBuilder.CreateIndex(
                name: "IX_ResistanceBands_Color",
                table: "ResistanceBands",
                column: "Color");

            migrationBuilder.CreateIndex(
                name: "IX_ResistanceBands_CreatedByUserId_CreatedDateTime_ModifiedByUserId_ModifiedDateTime",
                table: "ResistanceBands",
                columns: new[] { "CreatedByUserId", "CreatedDateTime", "ModifiedByUserId", "ModifiedDateTime" });

            migrationBuilder.CreateIndex(
                name: "IX_Resistances_Amount",
                table: "Resistances",
                column: "Amount");

            migrationBuilder.CreateIndex(
                name: "IX_Resistances_Color",
                table: "Resistances",
                column: "Color");

            migrationBuilder.CreateIndex(
                name: "IX_Resistances_ExecutedExerciseId",
                table: "Resistances",
                column: "ExecutedExerciseId");

            migrationBuilder.CreateIndex(
                name: "IX_Resistances_CreatedByUserId_CreatedDateTime_ModifiedByUserId_ModifiedDateTime",
                table: "Resistances",
                columns: new[] { "CreatedByUserId", "CreatedDateTime", "ModifiedByUserId", "ModifiedDateTime" });

            migrationBuilder.CreateIndex(
                name: "IX_Sets_ExerciseId",
                table: "Sets",
                column: "ExerciseId");

            migrationBuilder.CreateIndex(
                name: "IX_Sets_WorkoutId",
                table: "Sets",
                column: "WorkoutId");

            migrationBuilder.CreateIndex(
                name: "IX_Sets_CreatedByUserId_CreatedDateTime_ModifiedByUserId_ModifiedDateTime",
                table: "Sets",
                columns: new[] { "CreatedByUserId", "CreatedDateTime", "ModifiedByUserId", "ModifiedDateTime" });

            migrationBuilder.CreateIndex(
                name: "IX_TargetAreas_Name",
                table: "TargetAreas",
                column: "Name");

            migrationBuilder.CreateIndex(
                name: "IX_TargetAreas_CreatedByUserId_CreatedDateTime_ModifiedByUserId_ModifiedDateTime",
                table: "TargetAreas",
                columns: new[] { "CreatedByUserId", "CreatedDateTime", "ModifiedByUserId", "ModifiedDateTime" });

            migrationBuilder.CreateIndex(
                name: "IX_Users_Name",
                table: "Users",
                column: "Name");

            migrationBuilder.CreateIndex(
                name: "IX_Users_CreatedByUserId_CreatedDateTime_ModifiedByUserId_ModifiedDateTime",
                table: "Users",
                columns: new[] { "CreatedByUserId", "CreatedDateTime", "ModifiedByUserId", "ModifiedDateTime" });

            migrationBuilder.CreateIndex(
                name: "IX_Workouts_CreatedByUserId_CreatedDateTime_ModifiedByUserId_ModifiedDateTime",
                table: "Workouts",
                columns: new[] { "CreatedByUserId", "CreatedDateTime", "ModifiedByUserId", "ModifiedDateTime" });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ExecutedSets");

            migrationBuilder.DropTable(
                name: "ExecutedWorkouts");

            migrationBuilder.DropTable(
                name: "ExerciseTargetAreaLinks");

            migrationBuilder.DropTable(
                name: "ResistanceBands");

            migrationBuilder.DropTable(
                name: "Resistances");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropTable(
                name: "Sets");

            migrationBuilder.DropTable(
                name: "TargetAreas");

            migrationBuilder.DropTable(
                name: "ExecutedExercises");

            migrationBuilder.DropTable(
                name: "Workouts");

            migrationBuilder.DropTable(
                name: "Exercises");
        }
    }
}
