using Microsoft.EntityFrameworkCore.Migrations;

namespace WorkoutApplication.Data.Migrations
{
    public partial class ExecutedExerciseAdditions : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ExerciseInWorkout_Exercises_ExerciseId",
                table: "ExerciseInWorkout");

            migrationBuilder.AlterColumn<int>(
                name: "ExerciseId",
                table: "ExerciseInWorkout",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ActualRepCount",
                table: "ExecutedExercises",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "ExecutedWorkoutId",
                table: "ExecutedExercises",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Sequence",
                table: "ExecutedExercises",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "TargetRepCount",
                table: "ExecutedExercises",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_ExecutedExercises_ExecutedWorkoutId",
                table: "ExecutedExercises",
                column: "ExecutedWorkoutId");

            migrationBuilder.CreateIndex(
                name: "IX_ExecutedExercises_Sequence",
                table: "ExecutedExercises",
                column: "Sequence");

            migrationBuilder.AddForeignKey(
                name: "FK_ExecutedExercises_ExecutedWorkouts_ExecutedWorkoutId",
                table: "ExecutedExercises",
                column: "ExecutedWorkoutId",
                principalTable: "ExecutedWorkouts",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ExerciseInWorkout_Exercises_ExerciseId",
                table: "ExerciseInWorkout",
                column: "ExerciseId",
                principalTable: "Exercises",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ExecutedExercises_ExecutedWorkouts_ExecutedWorkoutId",
                table: "ExecutedExercises");

            migrationBuilder.DropForeignKey(
                name: "FK_ExerciseInWorkout_Exercises_ExerciseId",
                table: "ExerciseInWorkout");

            migrationBuilder.DropIndex(
                name: "IX_ExecutedExercises_ExecutedWorkoutId",
                table: "ExecutedExercises");

            migrationBuilder.DropIndex(
                name: "IX_ExecutedExercises_Sequence",
                table: "ExecutedExercises");

            migrationBuilder.DropColumn(
                name: "ActualRepCount",
                table: "ExecutedExercises");

            migrationBuilder.DropColumn(
                name: "ExecutedWorkoutId",
                table: "ExecutedExercises");

            migrationBuilder.DropColumn(
                name: "Sequence",
                table: "ExecutedExercises");

            migrationBuilder.DropColumn(
                name: "TargetRepCount",
                table: "ExecutedExercises");

            migrationBuilder.AlterColumn<int>(
                name: "ExerciseId",
                table: "ExerciseInWorkout",
                type: "int",
                nullable: true,
                oldClrType: typeof(int));

            migrationBuilder.AddForeignKey(
                name: "FK_ExerciseInWorkout_Exercises_ExerciseId",
                table: "ExerciseInWorkout",
                column: "ExerciseId",
                principalTable: "Exercises",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
