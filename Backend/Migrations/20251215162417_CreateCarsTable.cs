using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class CreateCarsTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // This migration is intentionally left empty.
            // The Cars table and related schema are already created
            // and updated by previous migrations (InitialCreate, UpdateCarModelWithAllFields, etc.).
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // No-op: nothing to revert because Up made no changes.
        }
    }
}
