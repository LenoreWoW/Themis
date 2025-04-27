/**
 * Export Utilities for Project Data Migration
 * 
 * These utilities help prepare the collected project data for export
 * and eventual import into the main Themis system.
 */

import config from '../config';

/**
 * Exports all projects to a JSON file for download
 * @param {Array} projects - Array of project objects to export
 * @returns {string} - The URL for the downloadable JSON file
 */
export const exportProjectsToJson = (projects) => {
  try {
    // Add metadata for migration
    const exportData = {
      metadata: {
        exportDate: new Date().toISOString(),
        exportedBy: JSON.parse(localStorage.getItem(config.auth.userStorageKey) || '{}').email || 'unknown',
        version: config.app.version,
        source: 'project_collector',
        recordCount: projects.length
      },
      projects: projects.map(transformProjectForThemis)
    };
    
    // Create blob and download link
    const jsonData = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    return url;
  } catch (error) {
    console.error('Error exporting projects', error);
    throw new Error('Failed to export projects: ' + error.message);
  }
};

/**
 * Transforms a project from Project Collector format to Themis format
 * @param {Object} project - The project to transform
 * @returns {Object} - The transformed project ready for Themis import
 */
export const transformProjectForThemis = (project) => {
  // This transformation ensures compatibility with Themis schema
  return {
    // Keep original project ID for tracking
    original_id: project.id,
    
    // Core project data
    name: project.title,
    description: project.description,
    
    // Dates - ensure ISO format
    startDate: project.startDate,
    endDate: project.endDate,
    createdAt: project.createdAt,
    updatedAt: new Date().toISOString(),
    
    // Status mapping (convert to Themis format)
    status: mapStatus(project.status),
    priority: mapPriority(project.priority),
    
    // Financial data
    budget: {
      approved: parseFloat(project.budget) || 0,
      spent: 0, // Will be populated in Themis
      currency: 'QAR'
    },
    
    // Additional data
    tags: project.tags || [],
    attachments: project.attachments || [],
    
    // Migration metadata
    importSource: 'project_collector',
    importDate: new Date().toISOString(),
  };
};

/**
 * Maps Project Collector status to Themis status
 * @param {string} status - The Project Collector status
 * @returns {string} - The equivalent Themis status
 */
const mapStatus = (status) => {
  const statusMap = {
    'planning': 'PLANNING',
    'in_progress': 'IN_PROGRESS',
    'completed': 'COMPLETED',
    'on_hold': 'ON_HOLD'
  };
  
  return statusMap[status] || 'PLANNING';
};

/**
 * Maps Project Collector priority to Themis priority
 * @param {string} priority - The Project Collector priority
 * @returns {string} - The equivalent Themis priority
 */
const mapPriority = (priority) => {
  const priorityMap = {
    'low': 'LOW',
    'medium': 'MEDIUM',
    'high': 'HIGH',
    'critical': 'CRITICAL'
  };
  
  return priorityMap[priority] || 'MEDIUM';
}; 