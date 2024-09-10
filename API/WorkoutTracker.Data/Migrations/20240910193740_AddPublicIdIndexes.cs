using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WorkoutTracker.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddPublicIdIndexes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_Workouts_PublicId",
                table: "Workouts",
                column: "PublicId");

            migrationBuilder.CreateIndex(
                name: "IX_Exercises_PublicId",
                table: "Exercises",
                column: "PublicId");

            migrationBuilder.CreateIndex(
                name: "IX_ExecutedWorkouts_PublicId",
                table: "ExecutedWorkouts",
                column: "PublicId");

            migrationBuilder.CreateIndex(
                name: "IX_Users_PublicId",
                table: "Users",
                column: "PublicId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Workouts_PublicId",
                table: "Workouts");

            migrationBuilder.DropIndex(
                name: "IX_Exercises_PublicId",
                table: "Exercises");

            migrationBuilder.DropIndex(
                name: "IX_ExecutedWorkouts_PublicId",
                table: "ExecutedWorkouts");

            migrationBuilder.DropIndex(
                name: "IX_Users_PublicId",
                table: "Users");
        }
    }
}
