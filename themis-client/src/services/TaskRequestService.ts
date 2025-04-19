import api from './api';
import { TaskRequest, TaskRequestStatus, Task } from '../types';

class TaskRequestService {
  // Helper to get token (in a real app, this would come from AuthContext)
  private getToken(): string {
    return localStorage.getItem('token') || '';
  }

  async createTaskRequest(requestData: Partial<TaskRequest>): Promise<TaskRequest> {
    const token = this.getToken();
    const response = await api.taskRequests.createTaskRequest(requestData, token);
    return response.data;
  }

  async getTaskRequests(projectId: string): Promise<TaskRequest[]> {
    const token = this.getToken();
    const response = await api.taskRequests.getTaskRequestsByProject(projectId, token);
    return response.data;
  }

  async getTaskRequestById(id: string): Promise<TaskRequest> {
    const token = this.getToken();
    const response = await api.taskRequests.getTaskRequestById(id, token);
    return response.data;
  }

  async updateTaskRequestStatus(
    id: string,
    status: TaskRequestStatus,
    reviewNotes?: string
  ): Promise<TaskRequest> {
    const token = this.getToken();
    const response = await api.taskRequests.updateTaskRequestStatus(id, status, reviewNotes, token);
    return response.data;
  }

  async approveTaskRequest(id: string, reviewNotes?: string): Promise<{ request: TaskRequest; task: Task }> {
    const token = this.getToken();
    const response = await api.taskRequests.approveTaskRequest(id, reviewNotes, token);
    return response.data;
  }

  async rejectTaskRequest(id: string, reviewNotes: string): Promise<TaskRequest> {
    const token = this.getToken();
    const response = await api.taskRequests.rejectTaskRequest(id, reviewNotes, token);
    return response.data;
  }
}

export const taskRequestService = new TaskRequestService(); 