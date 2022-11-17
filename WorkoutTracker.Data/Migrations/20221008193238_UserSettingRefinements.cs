using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WorkoutTracker.Data.Migrations
{
    public partial class UserSettingRefinements : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Goal",
                table: "UserSettings");

            migrationBuilder.DropColumn(
                name: "Goal",
                table: "UserMinMaxReps");

            migrationBuilder.AddColumn<byte>(
                name: "LowestAcceptableRating",
                table: "UserSettings",
                type: "tinyint",
                nullable: false,
                defaultValue: (byte)0);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "LowestAcceptableRating",
                table: "UserSettings");

            migrationBuilder.AddColumn<int>(
                name: "Goal",
                table: "UserSettings",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "Goal",
                table: "UserMinMaxReps",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }
    }
}
