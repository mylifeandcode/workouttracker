using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

namespace WorkoutApplication.Data.Migrations
{
    public partial class ExerciseInWorkoutInitial : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Sets_Workouts_WorkoutId",
                table: "Sets");

            migrationBuilder.DropIndex(
                name: "IX_Sets_WorkoutId",
                table: "Sets");

            migrationBuilder.DropColumn(
                name: "WorkoutId",
                table: "Sets");

            migrationBuilder.CreateTable(
                name: "ExerciseInWorkout",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    CreatedByUserId = table.Column<int>(nullable: false),
                    CreatedDateTime = table.Column<DateTime>(nullable: false),
                    ModifiedByUserId = table.Column<int>(nullable: true),
                    ModifiedDateTime = table.Column<DateTime>(nullable: true),
                    ExerciseId = table.Column<int>(nullable: true),
                    NumberOfSets = table.Column<short>(nullable: false),
                    SetType = table.Column<int>(nullable: false),
                    WorkoutId = table.Column<int>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ExerciseInWorkout", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ExerciseInWorkout_Exercises_ExerciseId",
                        column: x => x.ExerciseId,
                        principalTable: "Exercises",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ExerciseInWorkout_Workouts_WorkoutId",
                        column: x => x.WorkoutId,
                        principalTable: "Workouts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ExerciseInWorkout_ExerciseId",
                table: "ExerciseInWorkout",
                column: "ExerciseId");

            migrationBuilder.CreateIndex(
                name: "IX_ExerciseInWorkout_WorkoutId",
                table: "ExerciseInWorkout",
                column: "WorkoutId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ExerciseInWorkout");

            migrationBuilder.AddColumn<int>(
                name: "WorkoutId",
                table: "Sets",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Sets_WorkoutId",
                table: "Sets",
                column: "WorkoutId");

            migrationBuilder.AddForeignKey(
                name: "FK_Sets_Workouts_WorkoutId",
                table: "Sets",
                column: "WorkoutId",
                principalTable: "Workouts",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
