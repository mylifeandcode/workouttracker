using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WorkoutTracker.Data.Migrations
{
    /// <inheritdoc />
    public partial class FixExecutedWorkoutSetupRegistrationAndAddFilterIndex : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // NOTE: FK_ExecutedExercises_ExecutedWorkouts_ExecutedWorkoutId was dropped by migration
            // 20230527193215_AddExecutedWorkoutToExecutedExercise and never re-added (its re-creation
            // was left commented out there), so it does not exist on any real database today even
            // though the EF model has always claimed it does. This migration adds it for the first
            // time since 2023, rather than dropping+re-adding it, to match that reality.
            migrationBuilder.DropForeignKey(
                name: "FK_ExecutedWorkouts_Workouts_WorkoutId",
                table: "ExecutedWorkouts");

            migrationBuilder.AlterColumn<Guid>(
                name: "PublicId",
                table: "ExecutedWorkouts",
                type: "uniqueidentifier",
                nullable: false,
                defaultValueSql: "NEWID()",
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier");

            migrationBuilder.CreateIndex(
                name: "IX_ExecutedWorkouts_CreatedByUserId_CreatedDateTime_ModifiedByUserId_ModifiedDateTime",
                table: "ExecutedWorkouts",
                columns: new[] { "CreatedByUserId", "CreatedDateTime", "ModifiedByUserId", "ModifiedDateTime" });

            migrationBuilder.CreateIndex(
                name: "IX_ExecutedWorkouts_CreatedByUserId_StartDateTime_EndDateTime",
                table: "ExecutedWorkouts",
                columns: new[] { "CreatedByUserId", "StartDateTime", "EndDateTime" });

            // NOTE: IX_ExecutedWorkouts_PublicId already exists — it was added directly by
            // 20240910193740_AddPublicIdIndexes, bypassing the (until now unregistered) Fluent
            // config that also declares it, so it must not be created again here.

            migrationBuilder.CreateIndex(
                name: "IX_ExecutedWorkouts_Rating",
                table: "ExecutedWorkouts",
                column: "Rating");

            migrationBuilder.CreateIndex(
                name: "IX_ExecutedWorkouts_StartDateTime",
                table: "ExecutedWorkouts",
                column: "StartDateTime");

            migrationBuilder.AddForeignKey(
                name: "FK_ExecutedExercises_ExecutedWorkouts_ExecutedWorkoutId",
                table: "ExecutedExercises",
                column: "ExecutedWorkoutId",
                principalTable: "ExecutedWorkouts",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_ExecutedWorkouts_Workouts_WorkoutId",
                table: "ExecutedWorkouts",
                column: "WorkoutId",
                principalTable: "Workouts",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ExecutedExercises_ExecutedWorkouts_ExecutedWorkoutId",
                table: "ExecutedExercises");

            migrationBuilder.DropForeignKey(
                name: "FK_ExecutedWorkouts_Workouts_WorkoutId",
                table: "ExecutedWorkouts");

            migrationBuilder.DropIndex(
                name: "IX_ExecutedWorkouts_CreatedByUserId_CreatedDateTime_ModifiedByUserId_ModifiedDateTime",
                table: "ExecutedWorkouts");

            migrationBuilder.DropIndex(
                name: "IX_ExecutedWorkouts_CreatedByUserId_StartDateTime_EndDateTime",
                table: "ExecutedWorkouts");

            migrationBuilder.DropIndex(
                name: "IX_ExecutedWorkouts_Rating",
                table: "ExecutedWorkouts");

            migrationBuilder.DropIndex(
                name: "IX_ExecutedWorkouts_StartDateTime",
                table: "ExecutedWorkouts");

            migrationBuilder.AlterColumn<Guid>(
                name: "PublicId",
                table: "ExecutedWorkouts",
                type: "uniqueidentifier",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier",
                oldDefaultValueSql: "NEWID()");

            // Restore original state: no FK on ExecutedExercises.ExecutedWorkoutId (it was dropped
            // in 2023 and never re-added until this migration), and the original Cascade behavior
            // on ExecutedWorkouts.WorkoutId.
            migrationBuilder.AddForeignKey(
                name: "FK_ExecutedWorkouts_Workouts_WorkoutId",
                table: "ExecutedWorkouts",
                column: "WorkoutId",
                principalTable: "Workouts",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
