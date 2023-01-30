using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace API.Data.Migrations
{
    /// <inheritdoc />
    public partial class MinorChange : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "MyProperty",
                table: "Users",
                newName: "Created");

            migrationBuilder.RenameColumn(
                name: "KnownAss",
                table: "Users",
                newName: "KnownAs");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "KnownAs",
                table: "Users",
                newName: "KnownAss");

            migrationBuilder.RenameColumn(
                name: "Created",
                table: "Users",
                newName: "MyProperty");
        }
    }
}
