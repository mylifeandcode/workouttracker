using Microsoft.EntityFrameworkCore.Migrations;

namespace WorkoutTracker.Data.Migrations
{
    public partial class ExerciseAdditions : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Movement",
                table: "Exercises",
                maxLength: 4096,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "PointsToRemember",
                table: "Exercises",
                maxLength: 4096,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Setup",
                table: "Exercises",
                maxLength: 4096,
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Movement",
                table: "Exercises");

            migrationBuilder.DropColumn(
                name: "PointsToRemember",
                table: "Exercises");

            migrationBuilder.DropColumn(
                name: "Setup",
                table: "Exercises");
        }
    }
}
