using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WorkoutTracker.Data.Migrations
{
    /// <inheritdoc />
    public partial class ExerciseBilateralAddition : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ExecutedExercises_Exercises_ExerciseId",
                table: "ExecutedExercises");

            /*
            migrationBuilder.DropIndex(
                name: "IX_ExecutedExercises_ExerciseId",
                table: "ExecutedExercises");
            */

            migrationBuilder.AlterColumn<string>(
                name: "Discriminator",
                table: "Resistances",
                type: "nvarchar(21)",
                maxLength: 21,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AddColumn<bool>(
                name: "UsesBilateralResistance",
                table: "Exercises",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AlterColumn<string>(
                name: "Discriminator",
                table: "ExecutedSets",
                type: "nvarchar(21)",
                maxLength: 21,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            /*
            migrationBuilder.CreateIndex(
                name: "IX_ExecutedExercises_ExerciseId",
                table: "ExecutedExercises",
                column: "ExerciseId");
            */

            migrationBuilder.AddForeignKey(
                name: "FK_ExecutedExercises_Exercises_ExerciseId",
                table: "ExecutedExercises",
                column: "ExerciseId",
                principalTable: "Exercises",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ExecutedExercises_Exercises_ExerciseId",
                table: "ExecutedExercises");

            /*
            migrationBuilder.DropIndex(
                name: "IX_ExecutedExercises_ExerciseId",
                table: "ExecutedExercises");
            */

            migrationBuilder.DropColumn(
                name: "UsesBilateralResistance",
                table: "Exercises");

            migrationBuilder.AlterColumn<string>(
                name: "Discriminator",
                table: "Resistances",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(21)",
                oldMaxLength: 21);

            migrationBuilder.AlterColumn<string>(
                name: "Discriminator",
                table: "ExecutedSets",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(21)",
                oldMaxLength: 21);

            /*
            migrationBuilder.CreateIndex(
                name: "IX_ExecutedExercises_ExerciseId",
                table: "ExecutedExercises",
                column: "ExerciseId",
                unique: true);
            */

            migrationBuilder.AddForeignKey(
                name: "FK_ExecutedExercises_Exercises_ExerciseId",
                table: "ExecutedExercises",
                column: "ExerciseId",
                principalTable: "Exercises",
                principalColumn: "Id");
        }
    }
}
