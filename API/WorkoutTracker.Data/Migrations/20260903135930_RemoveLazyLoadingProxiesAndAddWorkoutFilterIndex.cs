using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WorkoutTracker.Data.Migrations
{
    /// <inheritdoc />
    public partial class RemoveLazyLoadingProxiesAndAddWorkoutFilterIndex : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_Workouts_CreatedByUserId_Active_Name",
                table: "Workouts",
                columns: new[] { "CreatedByUserId", "Active", "Name" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Workouts_CreatedByUserId_Active_Name",
                table: "Workouts");
        }
    }
}
