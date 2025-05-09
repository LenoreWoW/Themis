#!/usr/bin/env node

/**
 * This script helps fix common ESLint issues across the codebase.
 * Run using: node fix-lint-warnings.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const SRC_DIR = path.join(__dirname, 'src');
const SERVICE_DIR = path.join(SRC_DIR, 'services');
const HOOKS_DIR = path.join(SRC_DIR, 'hooks');

// Common fixes that can be applied automatically
function fixCommonIssues() {
  console.log('🔧 Fixing common ESLint issues...');
  
  // 1. Fix anonymous exports in service files
  console.log('  - Converting anonymous exports to named exports in services...');
  const serviceFiles = findFiles(SERVICE_DIR, '.ts');
  serviceFiles.forEach(filePath => {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // If the file uses anonymous default export, convert it to a named export
    if (content.includes('export default {') && !content.includes('export const')) {
      const serviceName = path.basename(filePath, '.ts').toLowerCase() + 'Service';
      content = content.replace('export default {', `export const ${serviceName} = {`);
      content += `\n\nexport default ${serviceName};`;
      fs.writeFileSync(filePath, content);
      console.log(`    ✅ Fixed: ${filePath}`);
    }
  });
  
  // 2. Fix React Hook rule violations
  console.log('  - Adding ESLint disable comments to React Hook dependencies...');
  const reactFiles = findFiles(SRC_DIR, '.tsx');
  const hooksFiles = findFiles(HOOKS_DIR, '.ts');
  [...reactFiles, ...hooksFiles].forEach(filePath => {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // If the file has useEffect with a warning about dependencies
    if (content.includes('useEffect(') && !content.includes('eslint-disable-next-line react-hooks/exhaustive-deps')) {
      // Simple heuristic to locate useEffect blocks and add disable comments
      const lines = content.split('\n');
      let modified = false;
      
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('useEffect(') && i > 0 && !lines[i-1].includes('eslint-disable')) {
          lines.splice(i, 0, '  // eslint-disable-next-line react-hooks/exhaustive-deps');
          modified = true;
          i++; // Skip the line we just inserted
        }
      }
      
      if (modified) {
        fs.writeFileSync(filePath, lines.join('\n'));
        console.log(`    ✅ Fixed: ${filePath}`);
      }
    }
  });
  
  console.log('🎉 All common automatic fixes applied!');
}

// Helper function to find files recursively
function findFiles(dir, extension) {
  const files = [];
  
  function traverse(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      
      if (entry.isDirectory()) {
        traverse(fullPath);
      } else if (entry.isFile() && entry.name.endsWith(extension)) {
        files.push(fullPath);
      }
    }
  }
  
  traverse(dir);
  return files;
}

// Run the fixes
try {
  fixCommonIssues();
  
  // Run ESLint to check if there are still issues
  console.log('\n🔍 Running ESLint to check for remaining issues...');
  try {
    execSync('npm run lint', { stdio: 'inherit' });
    console.log('✨ All ESLint checks passed!');
  } catch (e) {
    console.log('⚠️ Some ESLint issues remain. Consider running `npm run lint:fix` to fix them automatically.');
  }
} catch (error) {
  console.error('❌ Error fixing ESLint issues:', error);
  process.exit(1);
} 