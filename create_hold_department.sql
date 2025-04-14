-- Create Hold department if it doesn't exist
INSERT INTO "Departments" ("Id", "Name", "CreatedAt", "UpdatedAt")
SELECT 
    gen_random_uuid(), 
    'Hold',
    CURRENT_TIMESTAMP, 
    CURRENT_TIMESTAMP
WHERE NOT EXISTS (
    SELECT 1 FROM "Departments" WHERE "Name" = 'Hold'
);

-- Get the Hold department ID
DO $$
DECLARE
    hold_dept_id UUID;
BEGIN
    -- Get the Hold department ID
    SELECT "Id" INTO hold_dept_id FROM "Departments" WHERE "Name" = 'Hold';
    
    -- Update all users with null DepartmentId to use the Hold department
    UPDATE "Users" 
    SET 
        "DepartmentId" = hold_dept_id,
        "UpdatedAt" = CURRENT_TIMESTAMP
    WHERE "DepartmentId" IS NULL;
    
    -- Output the number of updated users
    RAISE NOTICE 'Updated % users to Hold department', 
        (SELECT COUNT(*) FROM "Users" WHERE "DepartmentId" = hold_dept_id);
END $$;

-- Create Admin department if it doesn't exist
INSERT INTO "Departments" ("Id", "Name", "CreatedAt", "UpdatedAt")
SELECT 
    gen_random_uuid(), 
    'Administration', 
    CURRENT_TIMESTAMP, 
    CURRENT_TIMESTAMP
WHERE NOT EXISTS (
    SELECT 1 FROM "Departments" WHERE "Name" = 'Administration'
);

-- Create default departments for different roles if they don't exist
INSERT INTO "Departments" ("Id", "Name", "CreatedAt", "UpdatedAt")
SELECT 
    gen_random_uuid(), 
    'IT', 
    CURRENT_TIMESTAMP, 
    CURRENT_TIMESTAMP
WHERE NOT EXISTS (
    SELECT 1 FROM "Departments" WHERE "Name" = 'IT'
);

INSERT INTO "Departments" ("Id", "Name", "CreatedAt", "UpdatedAt")
SELECT 
    gen_random_uuid(), 
    'PMO', 
    CURRENT_TIMESTAMP, 
    CURRENT_TIMESTAMP
WHERE NOT EXISTS (
    SELECT 1 FROM "Departments" WHERE "Name" = 'PMO'
);

INSERT INTO "Departments" ("Id", "Name", "CreatedAt", "UpdatedAt")
SELECT 
    gen_random_uuid(), 
    'Executive', 
    CURRENT_TIMESTAMP, 
    CURRENT_TIMESTAMP
WHERE NOT EXISTS (
    SELECT 1 FROM "Departments" WHERE "Name" = 'Executive'
);

INSERT INTO "Departments" ("Id", "Name", "CreatedAt", "UpdatedAt")
SELECT 
    gen_random_uuid(), 
    'Operations', 
    CURRENT_TIMESTAMP, 
    CURRENT_TIMESTAMP
WHERE NOT EXISTS (
    SELECT 1 FROM "Departments" WHERE "Name" = 'Operations'
);

-- Get the Admin department ID
DO $$
DECLARE
    admin_dept_id UUID;
BEGIN
    -- Get the Admin department ID
    SELECT "Id" INTO admin_dept_id FROM "Departments" WHERE "Name" = 'Administration';
    
    -- Update users with ADMIN role to Admin department if not already assigned
    UPDATE "Users" 
    SET 
        "DepartmentId" = admin_dept_id,
        "UpdatedAt" = CURRENT_TIMESTAMP
    WHERE "Role" = 'ADMIN' AND "DepartmentId" IN (
        SELECT "Id" FROM "Departments" WHERE "Name" = 'Hold'
    );
    
    -- Output the number of updated admin users
    RAISE NOTICE 'Updated % admin users to Administration department', 
        (SELECT COUNT(*) FROM "Users" WHERE "Role" = 'ADMIN' AND "DepartmentId" = admin_dept_id);
END $$;

-- Create an admin user if none exists
DO $$
DECLARE
    admin_dept_id UUID;
    admin_count INTEGER;
BEGIN
    -- Get the Admin department ID
    SELECT "Id" INTO admin_dept_id FROM "Departments" WHERE "Name" = 'Administration';
    
    -- Check if admin users exist
    SELECT COUNT(*) INTO admin_count FROM "Users" WHERE "Role" = 'ADMIN';
    
    -- If no admin users exist, create one
    IF admin_count = 0 THEN
        INSERT INTO "Users" (
            "Id", "Username", "ADIdentifier", "CreatedAt", "UpdatedAt",
            "Role", "DepartmentId"
        ) VALUES (
            gen_random_uuid(),
            'admin',
            'admin',
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP,
            'ADMIN',
            admin_dept_id
        );
        
        RAISE NOTICE 'Created admin user with ADIdentifier: admin';
    END IF;
END $$; 