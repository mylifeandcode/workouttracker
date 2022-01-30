using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WorkoutTracker.Data.Migrations
{
    public partial class RemoveSetEntities : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ExecutedSets_Sets_SetId",
                table: "ExecutedSets");

            migrationBuilder.DropTable(
                name: "Sets");

            migrationBuilder.DropIndex(
                name: "IX_ExecutedSets_SetId",
                table: "ExecutedSets");

            migrationBuilder.DropColumn(
                name: "SetId",
                table: "ExecutedSets");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "SetId",
                table: "ExecutedSets",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Sets",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ExerciseId = table.Column<int>(type: "int", nullable: true),
                    CreatedByUserId = table.Column<int>(type: "int", nullable: false),
                    CreatedDateTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Discriminator = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ModifiedByUserId = table.Column<int>(type: "int", nullable: true),
                    ModifiedDateTime = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Sequence = table.Column<short>(type: "smallint", nullable: false),
                    TargetRepCount = table.Column<int>(type: "int", nullable: true),
                    TargetTime = table.Column<TimeSpan>(type: "time", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Sets", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Sets_Exercises_ExerciseId",
                        column: x => x.ExerciseId,
                        principalTable: "Exercises",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_ExecutedSets_SetId",
                table: "ExecutedSets",
                column: "SetId");

            migrationBuilder.CreateIndex(
                name: "IX_Sets_CreatedByUserId_CreatedDateTime_ModifiedByUserId_ModifiedDateTime",
                table: "Sets",
                columns: new[] { "CreatedByUserId", "CreatedDateTime", "ModifiedByUserId", "ModifiedDateTime" });

            migrationBuilder.CreateIndex(
                name: "IX_Sets_ExerciseId",
                table: "Sets",
                column: "ExerciseId");

            migrationBuilder.AddForeignKey(
                name: "FK_ExecutedSets_Sets_SetId",
                table: "ExecutedSets",
                column: "SetId",
                principalTable: "Sets",
                principalColumn: "Id");
        }
    }
}
