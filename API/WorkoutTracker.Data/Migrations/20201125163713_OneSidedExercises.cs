using Microsoft.EntityFrameworkCore.Migrations;

namespace WorkoutTracker.Data.Migrations
{
    public partial class OneSidedExercises : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "OneSided",
                table: "Exercises",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<decimal>(
                name: "ResistanceAmount",
                table: "ExecutedExercises",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "ResistanceMakeup",
                table: "ExecutedExercises", 
                maxLength: 128, 
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "OneSided",
                table: "Exercises");

            migrationBuilder.DropColumn(
                name: "ResistanceAmount",
                table: "ExecutedExercises");

            migrationBuilder.DropColumn(
                name: "ResistanceMakeup",
                table: "ExecutedExercises");
        }
    }
}
