using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddDealershipIdToCar : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "DealershipId",
                table: "Cars",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Cars_DealershipId",
                table: "Cars",
                column: "DealershipId");

            migrationBuilder.AddForeignKey(
                name: "FK_Cars_CarDealerships_DealershipId",
                table: "Cars",
                column: "DealershipId",
                principalTable: "CarDealerships",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Cars_CarDealerships_DealershipId",
                table: "Cars");

            migrationBuilder.DropIndex(
                name: "IX_Cars_DealershipId",
                table: "Cars");

            migrationBuilder.DropColumn(
                name: "DealershipId",
                table: "Cars");
        }
    }
}
