import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Supabase credentials
const supabaseUrl = 'https://jxtsbjkfashodslayoaw.supabase.co';
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4dHNiamtmYXNob2RzbGF5b2F3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjI3NzU3NiwiZXhwIjoyMDYxODUzNTc2fQ.E80s0mW2s9l6D3z1YWjRaT6CKuvNWf5ObdQAdBygZg8';

// Create Supabase client with service role key for admin privileges
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

/**
 * This script facilitates data migration from the existing database to Supabase.
 * 
 * Steps:
 * 1. Export data from pmo.projects.mod.qa (separate process - see exportDataFromSource())
 * 2. Read the exported JSON files
 * 3. Import the data into Supabase tables
 */

// Export data from source function (this would need to be implemented separately)
async function exportDataFromSource() {
  console.log(`
=================================================================
IMPORTANT: This is a placeholder function.

To export data from the source database (pmo.projects.mod.qa), 
you'll need to:

1. Connect to the source database server
2. Run appropriate export queries for each table
3. Save the results as JSON files in the 'exported-data' directory

For example, using psql:
psql -h pmo.projects.mod.qa -U username -d themisdb -c "\\copy (SELECT * FROM users) TO 'users.json' WITH (FORMAT json);"
=================================================================
`);

  // Placeholder - this would be a separate process in reality
  console.log('Data export from source database needs to be done manually.');
  return true;
}

// Import data to Supabase
async function importDataToSupabase() {
  const exportDir = path.join(__dirname, '../../exported-data');
  
  // Create export directory if it doesn't exist
  if (!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir, { recursive: true });
    console.log(`Created export directory: ${exportDir}`);
  }
  
  // List of tables to migrate (in order of dependencies)
  const tables = [
    'users',
    'projects',
    'tasks',
    'comments',
    'documents',
    'notifications',
    'project_closures'
  ];
  
  for (const table of tables) {
    const filePath = path.join(exportDir, `${table}.json`);
    
    // Check if export file exists
    if (!fs.existsSync(filePath)) {
      console.log(`Export file for ${table} not found. Skipping...`);
      continue;
    }
    
    try {
      // Read the exported data
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      if (!Array.isArray(data) || data.length === 0) {
        console.log(`No data found in ${table}.json or invalid format. Skipping...`);
        continue;
      }
      
      console.log(`Importing ${data.length} records to ${table} table...`);
      
      // Clean existing data (optional - be careful with this!)
      // const { error: clearError } = await supabase.from(table).delete().gte('id', 0);
      // if (clearError) console.error(`Error clearing ${table} table:`, clearError);
      
      // Import data in batches of 100 records to avoid timeouts
      const batchSize = 100;
      for (let i = 0; i < data.length; i += batchSize) {
        const batch = data.slice(i, i + batchSize);
        const { error } = await supabase.from(table).upsert(batch);
        
        if (error) {
          console.error(`Error importing batch to ${table}:`, error);
        } else {
          console.log(`Imported batch ${i/batchSize + 1} of ${Math.ceil(data.length/batchSize)} to ${table}.`);
        }
      }
      
      console.log(`Completed import to ${table} table.`);
    } catch (error) {
      console.error(`Error processing ${table}.json:`, error);
    }
  }
  
  console.log('Data import completed.');
  return true;
}

// Create a sample exported data file for testing
async function createSampleExportFile() {
  const exportDir = path.join(__dirname, '../../exported-data');
  
  // Create export directory if it doesn't exist
  if (!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir, { recursive: true });
  }
  
  // Sample user data
  const sampleUsers = [
    {
      id: '00000000-0000-0000-0000-000000000001',
      email: 'admin@example.com',
      full_name: 'Admin User',
      role: 'ADMIN',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '00000000-0000-0000-0000-000000000002',
      email: 'manager@example.com',
      full_name: 'Project Manager',
      role: 'PROJECT_MANAGER',
      department: 'IT',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];
  
  // Write sample file
  fs.writeFileSync(
    path.join(exportDir, 'users.json'),
    JSON.stringify(sampleUsers, null, 2)
  );
  
  console.log('Created sample export file for users.');
  return true;
}

// Main function
async function main() {
  try {
    console.log('=== Data Migration to Supabase ===');
    
    // Step 1: Explain data export process
    await exportDataFromSource();
    
    // Create a sample export file for testing
    console.log('\nCreating a sample export file for demonstration...');
    await createSampleExportFile();
    
    // Step 2: Import data to Supabase
    console.log('\nImporting data to Supabase...');
    await importDataToSupabase();
    
    console.log('\nMigration process completed.');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration if this script is executed directly
if (require.main === module) {
  main();
}

export { exportDataFromSource, importDataToSupabase, createSampleExportFile }; 