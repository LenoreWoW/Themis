import LocalStorageService from '../services/LocalStorageService';
import { ChangeRequestType } from '../types/change-request';
import { mockDepartments, mockUsers } from '../services/mockData';
import { resetProjectsData } from './resetProjectsData';

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
 * We now only keep users and departments as mock data
 */
export const cleanupMockData = () => {
  console.log('Cleaning up mock data...');
  try {
    // Reset localStorage data
    localStorage.removeItem('changeRequests');
    localStorage.setItem('changeRequests', JSON.stringify([]));
    
    // Reset projects to empty array (no mock projects)
    resetProjectsData();
    
    // Also clear the 'projects' key which is separate from 'themis_projects'
    localStorage.removeItem('projects');
    localStorage.setItem('projects', JSON.stringify([]));
    
    // Clean up other mock data types
    localStorage.removeItem('themis_tasks');
    localStorage.removeItem('themis_meetings');
    localStorage.removeItem('themis_risks');
    localStorage.removeItem('themis_issues');
    
    console.log('All mock data except users and departments has been removed');
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
};

/**
 * This function used to fix project manager assignments,
 * but now we don't have mock projects at all
 */
export const cleanupProjects = () => {
  try {
    // Get projects from localStorage
    const storedProjects = localStorage.getItem('themis_projects');
    if (!storedProjects) return;
    
    // Just reset to empty array since we don't want mock projects
    localStorage.setItem('themis_projects', JSON.stringify([]));
    console.log('Removed all mock projects from localStorage');
  } catch (error) {
    console.error('Error cleaning up projects:', error);
  }
};

export default {
  cleanupMockData
}; 