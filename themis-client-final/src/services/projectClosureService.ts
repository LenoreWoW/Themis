import axios from 'axios';
import { API_BASE_URL } from '../config';
import { ProjectClosure, ProjectClosureAttachment, ProjectClosureSignOff, ProjectClosureChecklist } from '../types/project-closure';

const API_BASE_ENDPOINT = `${API_BASE_URL}/api/projects`;

export const projectClosureService = {
  // Get project closure by project ID
  getProjectClosureByProjectId: async (projectId: string): Promise<ProjectClosure> => {
    const response = await axios.get(`${API_BASE_ENDPOINT}/${projectId}/closure`);
    return response.data;
  },

  // Get project closure by ID
  getProjectClosureById: async (id: string): Promise<ProjectClosure> => {
    const response = await axios.get(`${API_BASE_ENDPOINT}/${id}/closure`);
    return response.data;
  },

  // Initiate project closure
  initiateProjectClosure: async (projectId: string): Promise<ProjectClosure> => {
    const response = await axios.post(`${API_BASE_ENDPOINT}/${projectId}/closure/initiate`);
    return response.data;
  },

  // Update project closure
  updateProjectClosure: async (projectId: string, data: Partial<ProjectClosure>): Promise<ProjectClosure> => {
    const response = await axios.put(`${API_BASE_ENDPOINT}/${projectId}/closure`, data);
    return response.data;
  },

  // Update project closure checklist
  updateChecklist: async (projectId: string, checklist: ProjectClosureChecklist): Promise<void> => {
    await axios.put(`${API_BASE_ENDPOINT}/${projectId}/closure/checklist`, checklist);
  },

  // Complete closure
  completeProjectClosure: async (projectId: string): Promise<void> => {
    await axios.post(`${API_BASE_ENDPOINT}/${projectId}/closure/complete`);
  },

  // Archive project
  archiveProject: async (projectId: string): Promise<void> => {
    await axios.post(`${API_BASE_ENDPOINT}/${projectId}/closure/archive`);
  },

  // Get sign-offs
  getSignOffs: async (projectId: string): Promise<ProjectClosureSignOff[]> => {
    const response = await axios.get(`${API_BASE_ENDPOINT}/${projectId}/closure/signoffs`);
    return response.data;
  },

  // Add stakeholder sign-off
  addStakeholderSignOff: async (projectId: string, stakeholderId: string, role: string): Promise<ProjectClosureSignOff> => {
    const response = await axios.post(`${API_BASE_ENDPOINT}/${projectId}/closure/signoffs`, {
      stakeholderId,
      role
    });
    return response.data;
  },

  // Approve sign-off
  approveSignOff: async (projectId: string, signOffId: string, comments?: string): Promise<ProjectClosureSignOff> => {
    const response = await axios.post(`${API_BASE_ENDPOINT}/${projectId}/closure/signoffs/${signOffId}/approve`, {
      comments
    });
    return response.data;
  },

  // Reject sign-off
  rejectSignOff: async (projectId: string, signOffId: string, comments?: string): Promise<ProjectClosureSignOff> => {
    const response = await axios.post(`${API_BASE_ENDPOINT}/${projectId}/closure/signoffs/${signOffId}/reject`, {
      comments
    });
    return response.data;
  },

  // Get attachments
  getAttachments: async (projectId: string): Promise<ProjectClosureAttachment[]> => {
    const response = await axios.get(`${API_BASE_ENDPOINT}/${projectId}/closure/attachments`);
    return response.data;
  },

  // Upload attachment
  uploadAttachment: async (projectId: string, file: File, category: string, description?: string): Promise<ProjectClosureAttachment> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);
    if (description) {
      formData.append('description', description);
    }

    const response = await axios.post(
      `${API_BASE_ENDPOINT}/${projectId}/closure/attachments`, 
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  // Delete attachment
  deleteAttachment: async (projectId: string, attachmentId: string): Promise<void> => {
    await axios.delete(`${API_BASE_ENDPOINT}/${projectId}/closure/attachments/${attachmentId}`);
  },

  // Generate final report
  generateFinalReport: async (projectId: string): Promise<void> => {
    await axios.post(`${API_BASE_ENDPOINT}/${projectId}/closure/report`);
  },

  // Export final report
  exportFinalReport: async (projectId: string, format: string = 'pdf'): Promise<Blob> => {
    const response = await axios.get(`${API_BASE_ENDPOINT}/${projectId}/closure/report/export?format=${format}`, {
      responseType: 'blob',
    });
    return response.data;
  }
}; 