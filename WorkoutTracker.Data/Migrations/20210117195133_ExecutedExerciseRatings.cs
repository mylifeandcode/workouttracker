using Microsoft.EntityFrameworkCore.Migrations;

namespace WorkoutTracker.Data.Migrations
{
    public partial class ExecutedExerciseRatings : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ExecutedExercises_Exercises_ExerciseId",
                table: "ExecutedExercises");

            migrationBuilder.DropForeignKey(
                name: "FK_ExecutedWorkouts_Workouts_WorkoutId",
                table: "ExecutedWorkouts");

            migrationBuilder.AlterColumn<int>(
                name: "WorkoutId",
                table: "ExecutedWorkouts",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "ExerciseId",
                table: "ExecutedExercises",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AddColumn<int>(
                name: "FormRating",
                table: "ExecutedExercises",
                nullable: false,
                defaultValue: 3);

            migrationBuilder.AddColumn<int>(
                name: "RangeOfMotionRating",
                table: "ExecutedExercises",
                nullable: false,
                defaultValue: 3);

            migrationBuilder.AddForeignKey(
                name: "FK_ExecutedExercises_Exercises_ExerciseId",
                table: "ExecutedExercises",
                column: "ExerciseId",
                principalTable: "Exercises",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ExecutedWorkouts_Workouts_WorkoutId",
                table: "ExecutedWorkouts",
                column: "WorkoutId",
                principalTable: "Workouts",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ExecutedExercises_Exercises_ExerciseId",
                table: "ExecutedExercises");

            migrationBuilder.DropForeignKey(
                name: "FK_ExecutedWorkouts_Workouts_WorkoutId",
                table: "ExecutedWorkouts");

            migrationBuilder.DropColumn(
                name: "FormRating",
                table: "ExecutedExercises");

            migrationBuilder.DropColumn(
                name: "RangeOfMotionRating",
                table: "ExecutedExercises");

            migrationBuilder.AlterColumn<int>(
                name: "WorkoutId",
                table: "ExecutedWorkouts",
                type: "int",
                nullable: true,
                oldClrType: typeof(int));

            migrationBuilder.AlterColumn<int>(
                name: "ExerciseId",
                table: "ExecutedExercises",
                type: "int",
                nullable: true,
                oldClrType: typeof(int));

            migrationBuilder.AddForeignKey(
                name: "FK_ExecutedExercises_Exercises_ExerciseId",
                table: "ExecutedExercises",
                column: "ExerciseId",
                principalTable: "Exercises",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ExecutedWorkouts_Workouts_WorkoutId",
                table: "ExecutedWorkouts",
                column: "WorkoutId",
                principalTable: "Workouts",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
