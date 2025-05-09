#!/usr/bin/env node

/**
 * Custom build script to bypass ESLint for production builds
 */
const { execSync } = require('child_process');

// Set environment variables to disable ESLint and stop treating warnings as errors
process.env.CI = 'false';
process.env.DISABLE_ESLINT_PLUGIN = 'true';
process.env.SKIP_PREFLIGHT_CHECK = 'true';

console.log('🚀 Starting production build with warnings disabled...');

try {
  // Use the existing build script from react-app-rewired
  execSync('react-app-rewired build && echo "/* /index.html 200" > build/_redirects', {
    stdio: 'inherit',
    env: {
      ...process.env,
      // These are set above but we're setting them again for safety
      CI: 'false',
      DISABLE_ESLINT_PLUGIN: 'true',
      SKIP_PREFLIGHT_CHECK: 'true'
    }
  });
  
  console.log('✅ Production build completed successfully!');
} catch (error) {
  console.error('❌ Build failed:', error);
  process.exit(1);
} 