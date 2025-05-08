/**
 * SELECTIVE CLEAN SCRIPT
 * 
 * This script clears all mock data EXCEPT for users and departments.
 * To use: Copy this entire file and paste it into your browser console,
 * or access it from http://localhost:3000/clean-except-users.js
 */

(function() {
  console.log('🧹 SELECTIVE CLEAN: Starting selective data cleanup...');
  
  try {
    // 1. Get a list of all localStorage keys
    const allKeys = Object.keys(localStorage);
    console.log(`Found ${allKeys.length} total items in localStorage`);
    
    // 2. Keys to preserve (users, departments, language settings)
    const preserveKeys = [
      'pmsLanguage',
      'themis_clean_initialized',
      'themis_departments',
      'departments',
      'users'
    ];
    
    // 3. Save any data we want to preserve
    const preservedData = {};
    preserveKeys.forEach(key => {
      if (localStorage.getItem(key)) {
        preservedData[key] = localStorage.getItem(key);
        console.log(`Preserved: ${key}`);
      }
    });
    
    // 4. Clear ALL localStorage data
    console.log('Clearing all localStorage data...');
    localStorage.clear();
    
    // 5. Restore preserved data
    Object.keys(preservedData).forEach(key => {
      localStorage.setItem(key, preservedData[key]);
      console.log(`Restored: ${key}`);
    });
    
    // 6. Initialize empty arrays for essential data structures
    const initializeEmptyArrays = [
      'changeRequests',
      'auditLogs',
      'projects',
      'tasks',
      'themis_projects',
      'themis_tasks',
      'themis_reviews',
      'themis_approvals',
      'themis_meetings',
      'themis_risks',
      'themis_issues',
      'themis_independent_tasks',
      'project_library',
      'project_templates'
    ];
    
    initializeEmptyArrays.forEach(key => {
      localStorage.setItem(key, JSON.stringify([]));
      console.log(`Initialized empty array for: ${key}`);
    });
    
    // 7. Clean up any remaining project-specific keys
    const remainingKeys = Object.keys(localStorage);
    const projectSpecificKeys = remainingKeys.filter(key => key.startsWith('project_') || key.includes('_project_'));
    
    if (projectSpecificKeys.length > 0) {
      console.log(`Found ${projectSpecificKeys.length} project-specific keys to remove`);
      projectSpecificKeys.forEach(key => {
        if (!preserveKeys.includes(key)) {
          localStorage.removeItem(key);
          console.log(`Removed: ${key}`);
        }
      });
    }
    
    // 8. Final confirmation
    console.log('✅ SELECTIVE CLEAN COMPLETE');
    console.log('Users and departments data has been preserved.');
    console.log('All other mock data has been cleared.');
    console.log('Please refresh the page to see changes.');
    
    // 9. Force a reload
    if (confirm('Selective clean completed. Would you like to reload the page now?')) {
      window.location.reload(true); // true forces a reload from server not cache
    }
  } catch (error) {
    console.error('❌ Error during selective clean:', error);
    alert('An error occurred during selective clean. Please see console for details.');
  }
})(); 