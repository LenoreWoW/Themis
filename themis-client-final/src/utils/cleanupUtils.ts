import LocalStorageService from '../services/LocalStorageService';

/**
 * Clears all test data from localStorage
 * This function removes all items with keys that start with 'themis_'
 */
export const clearAllTestData = (): void => {
  console.log('Clearing all test data from the application...');
  
  // Clear localStorage entries
  LocalStorageService.clearAllData();
  
  // Force clear specific key items
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('themis_projects');
  localStorage.removeItem('themis_tasks');
  localStorage.removeItem('themis_meetings');
  localStorage.removeItem('themis_risks');
  localStorage.removeItem('themis_issues');
  localStorage.removeItem('themis_independent_tasks');
  localStorage.removeItem('themis_departments');
  
  // Clear any session-specific data as well
  sessionStorage.clear();
  
  console.log('All application data has been cleared');
};

/**
 * Initializes the application with empty state
 * This should be called on application startup
 */
export const initializeCleanApplication = (): void => {
  // Clear all localStorage and sessionStorage data
  clearAllTestData();
  
  // Set flag in localStorage to indicate the app has been cleaned
  localStorage.setItem('themis_clean_initialized', 'true');
  
  console.log('Application initialized with clean state');
};

/**
 * Check if the app has been properly cleaned
 */
export const isAppClean = (): boolean => {
  return localStorage.getItem('themis_clean_initialized') === 'true';
}; 