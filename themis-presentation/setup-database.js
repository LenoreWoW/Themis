// This script compiles and runs the database setup
require('esbuild').buildSync({
  entryPoints: ['src/lib/supabase-setup.ts'],
  bundle: true,
  platform: 'node',
  target: 'node16',
  outfile: 'dist/setup-database.js',
});

console.log('Compiled database setup script. Now running...');
require('./dist/setup-database.js'); 