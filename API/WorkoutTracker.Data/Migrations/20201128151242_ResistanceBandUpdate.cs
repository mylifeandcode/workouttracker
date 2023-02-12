using Microsoft.EntityFrameworkCore.Migrations;

namespace WorkoutTracker.Data.Migrations
{
    public partial class ResistanceBandUpdate : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ResistanceAmount",
                table: "ResistanceBands");

            migrationBuilder.AddColumn<decimal>(
                name: "MaxResistanceAmount",
                table: "ResistanceBands",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<short>(
                name: "NumberAvailable",
                table: "ResistanceBands",
                nullable: false,
                defaultValue: (short)0);

            migrationBuilder.AlterColumn<string>(
                name: "ResistanceMakeup",
                table: "ExecutedExercises",
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "decimal(18,2)");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "MaxResistanceAmount",
                table: "ResistanceBands");

            migrationBuilder.DropColumn(
                name: "NumberAvailable",
                table: "ResistanceBands");

            migrationBuilder.AddColumn<decimal>(
                name: "ResistanceAmount",
                table: "ResistanceBands",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AlterColumn<decimal>(
                name: "ResistanceMakeup",
                table: "ExecutedExercises",
                type: "decimal(18,2)",
                nullable: false,
                oldClrType: typeof(string),
                oldNullable: true);
        }
    }
}
