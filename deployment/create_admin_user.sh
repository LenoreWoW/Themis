#!/bin/bash
# Create admin user script

DB_NAME="themis_db"

# Add an admin department and user
sudo -u postgres psql -d $DB_NAME << EOF
-- Insert admin department
INSERT INTO departments (name, description) 
VALUES ('Administration', 'System Administration Department');

-- Insert admin user (password hash for 'admin123' - change this in production!)
INSERT INTO users (username, first_name, last_name, email, password_hash, role, department_id) 
VALUES (
  'admin', 
  'System', 
  'Administrator', 
  'admin@example.com', 
  '\$2b\$10\$rRuVDscn4PRMBtdLVQB2ye8U2OqE5MnD5NZX/ZoU7bgW1vTjVnQjq', 
  'ADMIN', 
  1
);
EOF

echo "Admin user created successfully!" 