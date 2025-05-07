import axios from 'axios';
import { ApiResponse, Project } from '../types';
import { API_BASE_URL } from '../config';

export async function updateProjectStatus(
  id: string,
  status: string,
  comment?: string
): Promise<ApiResponse<Project>> {
  try {
    const response = await axios.patch<ApiResponse<Project>>(
      `${API_BASE_URL}/projects/${id}/status`,
      { status, comment },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error updating project status:', error);
    throw error;
  }
}

export async function applyApproval(
  project: Project,
  newStatus: string
): Promise<ApiResponse<Project>> {
  try {
    // When the project is approved by Main PMO, set status to PLANNING instead of APPROVED
    const finalStatus = newStatus === 'APPROVED' ? 'PLANNING' : newStatus;
    
    const response = await updateProjectStatus(project.id, finalStatus);
    return response;
  } catch (error) {
    console.error('Error applying approval:', error);
    throw error;
  }
} 