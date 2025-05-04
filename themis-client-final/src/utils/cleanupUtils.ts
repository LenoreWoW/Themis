import LocalStorageService from '../services/LocalStorageService';
import { ChangeRequestType } from '../types/change-request';

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

/**
 * Clean up localStorage items to remove mock data
 */
export const cleanupMockData = () => {
  try {
    // APPROACH CHANGED: Instead of filtering, completely reset the changeRequests data
    console.log('Completely resetting change requests data...');
    localStorage.removeItem('changeRequests');
    localStorage.setItem('changeRequests', JSON.stringify([]));
    console.log('Change requests data has been reset to empty array');
    
    // Also clean up potential mock audit logs
    const auditLogsData = localStorage.getItem('auditLogs') || '[]';
    let auditLogs = [];
    
    try {
      auditLogs = JSON.parse(auditLogsData);
      
      // Filter out mock audit logs
      const filteredLogs = auditLogs.filter((log: any) => {
        return (
          log && 
          typeof log === 'object' && 
          log.projectId && 
          log.action &&
          log.entityType
        );
      });
      
      // Save filtered logs back to localStorage
      localStorage.setItem('auditLogs', JSON.stringify(filteredLogs));
      console.log(`Removed ${auditLogs.length - filteredLogs.length} invalid audit logs`);
    } catch (e) {
      console.error('Error parsing audit logs:', e);
      // Reset audit logs as well
      localStorage.setItem('auditLogs', JSON.stringify([]));
    }
    
    return {
      success: true,
      message: 'Mock data has been cleaned up'
    };
  } catch (error) {
    console.error('Error cleaning up mock data:', error);
    return {
      success: false,
      message: 'Failed to clean up mock data'
    };
  }
};

export default {
  cleanupMockData
}; 