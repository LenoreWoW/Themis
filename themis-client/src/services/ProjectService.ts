import api from './api';
import { Project } from '../types';

class ProjectService {
  // Helper to get token (in a real app, this would come from AuthContext)
  private getToken(): string {
    return localStorage.getItem('token') || '';
  }

  async getProjects(): Promise<Project[]> {
    const response = await api.projects.getAllProjects(this.getToken());
    return response.data;
  }

  async getProjectById(id: string): Promise<Project> {
    const response = await api.projects.getProjectById(id, this.getToken());
    return response.data;
  }

  async createProject(projectData: Partial<Project>): Promise<Project> {
    const response = await api.projects.createProject(projectData, this.getToken());
    return response.data;
  }

  async updateProject(id: string, projectData: Partial<Project>): Promise<Project> {
    const response = await api.projects.updateProject(id, projectData, this.getToken());
    return response.data;
  }

  async deleteProject(id: string): Promise<void> {
    await api.projects.deleteProject(id, this.getToken());
  }
}

export const projectService = new ProjectService(); 