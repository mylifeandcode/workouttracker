using Microsoft.EntityFrameworkCore.Migrations;

namespace WorkoutTracker.Data.Migrations
{
    public partial class ExerciseTypeOfResistanceColumnRename : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            /*
            Commented out 1/26/2021 after this caused an exception on a 
            fresh database which never had the original column name.
            I originally tried adding a try/catch block, but the catch 
            was never invoked -- the error happens elsewhere.
            Re-enable the block below if needed, but I doubt it will.
            */
            /*
            migrationBuilder.RenameColumn(
                name: "TypeOfResistance",
                table: "Exercises",
                newName: "ResistanceType");
            */
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
