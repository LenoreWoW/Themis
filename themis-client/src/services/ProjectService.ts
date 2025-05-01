import api from './api';
import { Project } from '../types';

class ProjectService {
  // Helper to get token (in a real app, this would come from AuthContext)
  private getToken(): string {
    return localStorage.getItem('token') || '';
  }

  async getProjects(): Promise<Project[]> {
    try {
      const response = await api.projects.getAllProjects(this.getToken());
      return response.data;
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  }

  async getProjectById(id: string): Promise<Project> {
    try {
      const response = await api.projects.getProjectById(id, this.getToken());
      return response.data;
    } catch (error) {
      console.error(`Error fetching project ${id}:`, error);
      throw error;
    }
  }

  async createProject(projectData: Partial<Project>): Promise<Project> {
    try {
      const response = await api.projects.createProject(projectData, this.getToken());
      return response.data;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  }

  async updateProject(id: string, projectData: Partial<Project>): Promise<Project> {
    try {
      const response = await api.projects.updateProject(id, projectData, this.getToken());
      return response.data;
    } catch (error) {
      console.error(`Error updating project ${id}:`, error);
      throw error;
    }
  }

  async deleteProject(id: string): Promise<void> {
    try {
      await api.projects.deleteProject(id, this.getToken());
    } catch (error) {
      console.error(`Error deleting project ${id}:`, error);
      throw error;
    }
  }
}

export const projectService = new ProjectService(); 