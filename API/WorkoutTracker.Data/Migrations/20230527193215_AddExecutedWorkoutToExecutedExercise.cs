using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WorkoutTracker.Data.Migrations
{
    public partial class AddExecutedWorkoutToExecutedExercise : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ExecutedExercises_ExecutedWorkouts_ExecutedWorkoutId",
                table: "ExecutedExercises");

            migrationBuilder.DropForeignKey(
                name: "FK_ExecutedExercises_Exercises_ExerciseId",
                table: "ExecutedExercises");

            migrationBuilder.DropIndex(
                name: "IX_ExecutedExercises_ExerciseId",
                table: "ExecutedExercises");

            migrationBuilder.AlterColumn<int>(
                name: "ExecutedWorkoutId",
                table: "ExecutedExercises",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            /*
            migrationBuilder.CreateIndex(
                name: "IX_ExecutedExercises_ExerciseId",
                table: "ExecutedExercises",
                column: "ExerciseId",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_ExecutedExercises_ExecutedWorkouts_ExecutedWorkoutId",
                table: "ExecutedExercises",
                column: "ExecutedWorkoutId",
                principalTable: "ExecutedWorkouts",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
            */

            migrationBuilder.AddForeignKey(
                name: "FK_ExecutedExercises_Exercises_ExerciseId",
                table: "ExecutedExercises",
                column: "ExerciseId",
                principalTable: "Exercises",
                principalColumn: "Id");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            /*
            migrationBuilder.DropForeignKey(
                name: "FK_ExecutedExercises_ExecutedWorkouts_ExecutedWorkoutId",
                table: "ExecutedExercises");
            */

            migrationBuilder.DropForeignKey(
                name: "FK_ExecutedExercises_Exercises_ExerciseId",
                table: "ExecutedExercises");

            /*
            migrationBuilder.DropIndex(
                name: "IX_ExecutedExercises_ExerciseId",
                table: "ExecutedExercises");
            */

            migrationBuilder.AlterColumn<int>(
                name: "ExecutedWorkoutId",
                table: "ExecutedExercises",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.CreateIndex(
                name: "IX_ExecutedExercises_ExerciseId",
                table: "ExecutedExercises",
                column: "ExerciseId");

            migrationBuilder.AddForeignKey(
                name: "FK_ExecutedExercises_ExecutedWorkouts_ExecutedWorkoutId",
                table: "ExecutedExercises",
                column: "ExecutedWorkoutId",
                principalTable: "ExecutedWorkouts",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_ExecutedExercises_Exercises_ExerciseId",
                table: "ExecutedExercises",
                column: "ExerciseId",
                principalTable: "Exercises",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
