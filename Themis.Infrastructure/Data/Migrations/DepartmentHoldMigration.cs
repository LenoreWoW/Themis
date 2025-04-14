using Microsoft.EntityFrameworkCore.Migrations;
using System;

namespace Themis.Infrastructure.Data.Migrations
{
    public partial class DepartmentHoldMigration : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Create the Hold department
            migrationBuilder.InsertData(
                table: "Departments",
                columns: new[] { "Id", "Name", "CreatedAt", "UpdatedAt" },
                values: new object[] { Guid.NewGuid(), "Hold", DateTime.UtcNow, DateTime.UtcNow }
            );

            // Create the Administration department
            migrationBuilder.InsertData(
                table: "Departments",
                columns: new[] { "Id", "Name", "CreatedAt", "UpdatedAt" },
                values: new object[] { Guid.NewGuid(), "Administration", DateTime.UtcNow, DateTime.UtcNow }
            );

            // Create the PMO department
            migrationBuilder.InsertData(
                table: "Departments",
                columns: new[] { "Id", "Name", "CreatedAt", "UpdatedAt" },
                values: new object[] { Guid.NewGuid(), "PMO", DateTime.UtcNow, DateTime.UtcNow }
            );

            // Create other common departments
            migrationBuilder.InsertData(
                table: "Departments",
                columns: new[] { "Id", "Name", "CreatedAt", "UpdatedAt" },
                values: new object[] { Guid.NewGuid(), "IT", DateTime.UtcNow, DateTime.UtcNow }
            );

            migrationBuilder.InsertData(
                table: "Departments",
                columns: new[] { "Id", "Name", "CreatedAt", "UpdatedAt" },
                values: new object[] { Guid.NewGuid(), "Executive", DateTime.UtcNow, DateTime.UtcNow }
            );

            migrationBuilder.InsertData(
                table: "Departments",
                columns: new[] { "Id", "Name", "CreatedAt", "UpdatedAt" },
                values: new object[] { Guid.NewGuid(), "Operations", DateTime.UtcNow, DateTime.UtcNow }
            );

            // SQL to assign users without departments to the Hold department
            migrationBuilder.Sql(@"
                DO $$
                DECLARE
                    hold_dept_id UUID;
                BEGIN
                    -- Get the Hold department ID
                    SELECT ""Id"" INTO hold_dept_id FROM ""Departments"" WHERE ""Name"" = 'Hold';
                    
                    -- Update all users with null DepartmentId to use the Hold department
                    UPDATE ""Users"" 
                    SET 
                        ""DepartmentId"" = hold_dept_id,
                        ""UpdatedAt"" = CURRENT_TIMESTAMP
                    WHERE ""DepartmentId"" IS NULL;
                END $$;
            ");

            // Create an admin user if none exists
            migrationBuilder.Sql(@"
                DO $$
                DECLARE
                    admin_dept_id UUID;
                    admin_count INTEGER;
                BEGIN
                    -- Get the Admin department ID
                    SELECT ""Id"" INTO admin_dept_id FROM ""Departments"" WHERE ""Name"" = 'Administration';
                    
                    -- Check if admin users exist
                    SELECT COUNT(*) INTO admin_count FROM ""Users"" WHERE ""Role"" = 'ADMIN';
                    
                    -- If no admin users exist, create one
                    IF admin_count = 0 THEN
                        INSERT INTO ""Users"" (
                            ""Id"", ""Username"", ""ADIdentifier"", ""CreatedAt"", ""UpdatedAt"",
                            ""Role"", ""DepartmentId""
                        ) VALUES (
                            gen_random_uuid(),
                            'admin',
                            'admin',
                            CURRENT_TIMESTAMP,
                            CURRENT_TIMESTAMP,
                            'ADMIN',
                            admin_dept_id
                        );
                    END IF;
                END $$;
            ");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // SQL to undo the changes
            migrationBuilder.Sql(@"
                DELETE FROM ""Departments"" WHERE ""Name"" IN ('Hold', 'Administration', 'PMO', 'IT', 'Executive', 'Operations');
            ");
        }
    }
} 