using Microsoft.EntityFrameworkCore.Migrations;

namespace WorkoutApplication.Data.Migrations
{
    public partial class ResistanceTypes : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "TypeOfResistance",
                table: "Exercises",
                nullable: false,
                defaultValue: 2);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "TypeOfResistance",
                table: "Exercises");
        }
    }
}
