-- Create the Administration department if it doesn't exist
INSERT INTO "Departments" ("Id", "Name", "CreatedAt", "UpdatedAt")
SELECT 
    gen_random_uuid(), 
    'Administration',
    CURRENT_TIMESTAMP, 
    CURRENT_TIMESTAMP
WHERE NOT EXISTS (
    SELECT 1 FROM "Departments" WHERE "Name" = 'Administration'
);

-- Create admin users if none exist
DO $$
DECLARE
    admin_dept_id UUID;
BEGIN
    -- Get the Admin department ID
    SELECT "Id" INTO admin_dept_id FROM "Departments" WHERE "Name" = 'Administration';
    
    -- Delete existing users with these ADIdentifiers to avoid conflicts
    DELETE FROM "Users" WHERE "ADIdentifier" IN ('admin', 'admin@themis.local');
    
    -- Create an admin user with ADIdentifier 'admin'
    -- Admin role value is 6
    INSERT INTO "Users" (
        "Id", "Username", "ADIdentifier", "Role", "DepartmentId", "CreatedAt", "UpdatedAt"
    ) VALUES (
        gen_random_uuid(),
        'admin',
        'admin',
        6, -- Admin = 6
        admin_dept_id,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    );
    
    -- Also create admin@themis.local user
    INSERT INTO "Users" (
        "Id", "Username", "ADIdentifier", "Role", "DepartmentId", "CreatedAt", "UpdatedAt"
    ) VALUES (
        gen_random_uuid(),
        'admin_local',
        'admin@themis.local',
        6, -- Admin = 6
        admin_dept_id,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    );
    
    RAISE NOTICE 'Created admin users with ADIdentifiers: admin and admin@themis.local';
END $$; 