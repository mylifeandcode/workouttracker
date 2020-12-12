using Microsoft.EntityFrameworkCore.Migrations;

namespace WorkoutApplication.Data.Migrations
{
    public partial class ExerciseTypeOfResistanceColumnRename : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "TypeOfResistance",
                table: "Exercises",
                newName: "ResistanceType");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "ResistanceType",
                table: "Exercises",
                newName: "TypeOfResistance");
        }
    }
}
