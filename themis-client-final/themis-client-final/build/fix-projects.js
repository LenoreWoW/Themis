/**
 * PROJECT AUDIT FIX SCRIPT
 * 
 * This script specifically addresses project data that might be stuck in localStorage
 * and causing the compliance audit to show "missing project manager" warnings.
 * 
 * To use: Run this script in your browser console or navigate to http://localhost:3000/fix-projects.js
 */

(function() {
  console.log('🧹 PROJECT FIX: Starting project data cleanup...');
  
  try {
    // Remove and reset all project-related data from localStorage
    const projectKeys = [
      'projects',
      'themis_projects',
      'project_library',
      'project_templates'
    ];
    
    projectKeys.forEach(key => {
      if (localStorage.getItem(key)) {
        console.log(`Removing ${key} from localStorage`);
        localStorage.removeItem(key);
        localStorage.setItem(key, JSON.stringify([]));
      }
    });
    
    // Find and remove any project-specific keys
    const allKeys = Object.keys(localStorage);
    const projectSpecificKeys = allKeys.filter(key => key.startsWith('project_') || key.includes('_project_'));
    
    if (projectSpecificKeys.length > 0) {
      console.log(`Found ${projectSpecificKeys.length} project-specific keys to remove`);
      projectSpecificKeys.forEach(key => {
        console.log(`Removing ${key}`);
        localStorage.removeItem(key);
      });
    }
    
    // Success message
    console.log('✅ PROJECT FIX COMPLETE: All project data has been removed from localStorage');
    alert('Project data has been cleared successfully! Please refresh the page to see the changes.');
    
    // Force a reload
    if (confirm('Would you like to reload the page now?')) {
      window.location.reload(true); // Force reload from server
    }
  } catch (error) {
    console.error('❌ Error during project fix:', error);
    alert('An error occurred while fixing project data. Please see console for details.');
  }
})(); 