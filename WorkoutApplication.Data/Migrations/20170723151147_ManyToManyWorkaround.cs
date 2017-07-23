using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Metadata;

namespace WorkoutApplication.Data.Migrations
{
    public partial class ManyToManyWorkaround : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_TargetAreas_Exercises_ExerciseId",
                table: "TargetAreas");

            migrationBuilder.DropIndex(
                name: "IX_TargetAreas_ExerciseId",
                table: "TargetAreas");

            migrationBuilder.DropColumn(
                name: "ExerciseId",
                table: "TargetAreas");

            migrationBuilder.RenameColumn(
                name: "Notes",
                table: "ExecutedWorkouts",
                newName: "Journal");

            migrationBuilder.CreateTable(
                name: "ExerciseTargetAreaLinks",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    CreatedBy = table.Column<string>(nullable: true),
                    CreatedDateTime = table.Column<DateTime>(nullable: false),
                    ExerciseId = table.Column<int>(nullable: false),
                    ModifiedBy = table.Column<string>(nullable: true),
                    ModifiedDateTime = table.Column<DateTime>(nullable: false),
                    TargetAreaId = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ExerciseTargetAreaLinks", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ExerciseTargetAreaLinks_Exercises_ExerciseId",
                        column: x => x.ExerciseId,
                        principalTable: "Exercises",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ExerciseTargetAreaLinks_TargetAreas_TargetAreaId",
                        column: x => x.TargetAreaId,
                        principalTable: "TargetAreas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ExerciseTargetAreaLinks_ExerciseId",
                table: "ExerciseTargetAreaLinks",
                column: "ExerciseId");

            migrationBuilder.CreateIndex(
                name: "IX_ExerciseTargetAreaLinks_TargetAreaId",
                table: "ExerciseTargetAreaLinks",
                column: "TargetAreaId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ExerciseTargetAreaLinks");

            migrationBuilder.RenameColumn(
                name: "Journal",
                table: "ExecutedWorkouts",
                newName: "Notes");

            migrationBuilder.AddColumn<int>(
                name: "ExerciseId",
                table: "TargetAreas",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_TargetAreas_ExerciseId",
                table: "TargetAreas",
                column: "ExerciseId");

            migrationBuilder.AddForeignKey(
                name: "FK_TargetAreas_Exercises_ExerciseId",
                table: "TargetAreas",
                column: "ExerciseId",
                principalTable: "Exercises",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
