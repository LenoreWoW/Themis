import { mockUsers, mockDepartments } from '../services/mockData';
import { Project, ProjectStatus, ProjectPriority, ProjectTemplateType } from '../types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Resets all project data to use only empty project data
 * No mock projects are used, only departments and users are kept
 */
export const resetProjectsData = () => {
  try {
    console.log('Resetting projects data to empty...');
    
    // Clear all projects from localStorage
    localStorage.setItem('themis_projects', JSON.stringify([]));
    console.log('Projects data has been reset to empty array');
    
    return {
      success: true,
      message: 'Projects data has been reset to empty array'
    };
  } catch (error) {
    console.error('Error resetting projects data:', error);
    return {
      success: false,
      message: 'Failed to reset projects data'
    };
  }
}; 