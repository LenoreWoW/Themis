/**
 * EMERGENCY RESET SCRIPT - AGGRESSIVE VERSION
 * 
 * This script completely resets all localStorage and sessionStorage data for the Themis application.
 * To use: Copy this entire file and paste it into your browser console.
 */

(function() {
  console.log('⚠️ EMERGENCY RESET: Starting complete data purge...');
  
  try {
    // 1. Get a list of all localStorage keys
    const allKeys = Object.keys(localStorage);
    console.log(`Found ${allKeys.length} total items in localStorage`);
    
    // 2. Keep track of what will be preserved (language settings, etc.)
    const preserveKeys = ['themisLanguage'];
    const preservedData = {};
    
    // 3. Save any data we want to preserve
    preserveKeys.forEach(key => {
      if (localStorage.getItem(key)) {
        preservedData[key] = localStorage.getItem(key);
        console.log(`Preserved: ${key}`);
      }
    });
    
    // 4. Clear ALL browser storage
    console.log('Clearing all localStorage data...');
    localStorage.clear();
    
    console.log('Clearing all sessionStorage data...');
    sessionStorage.clear();
    
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
      'themis_approvals'
    ];
    
    initializeEmptyArrays.forEach(key => {
      localStorage.setItem(key, JSON.stringify([]));
      console.log(`Initialized empty array for: ${key}`);
    });
    
    // 7. Final confirmation
    console.log('✅ EMERGENCY RESET COMPLETE');
    console.log('Please refresh the page to see changes. If issues persist, try restarting your browser.');
    
    // 8. Force a hard reload
    if (confirm('Reset completed. Would you like to reload the page now?')) {
      window.location.reload(true); // true forces a reload from server not cache
    }
  } catch (error) {
    console.error('❌ Error during reset:', error);
    alert('An error occurred during reset. Please see console for details.');
  }
})(); 