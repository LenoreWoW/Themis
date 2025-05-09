import { ApiResponse, Project, ProjectStatus, UserRole } from '../types';
import { ChangeRequest, ChangeRequestStatus, ChangeRequestType, ChangeRequestSubmitData } from '../types/change-request';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { v4 as uuidv4 } from 'uuid';
import { getNextApprovalStatus, ApprovalStatus } from '../context/AuthContext';

// Helper function to make API requests without importing from api.ts
const makeRequest = async <T>(endpoint: string, method = 'GET', data?: any, token?: string): Promise<ApiResponse<T>> => {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const config = {
      method,
      url: `${API_BASE_URL}${endpoint}`,
      headers,
      data: method !== 'GET' ? data : undefined,
      params: method === 'GET' && data ? data : undefined
    };
    
    const response = await axios(config);
    
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Create a new change request
 * @param data Change request data
 * @param token JWT token
 * @returns Promise<ApiResponse<ChangeRequest>>
 */
const createChangeRequest = async (data: ChangeRequestSubmitData, token?: string): Promise<ApiResponse<ChangeRequest>> => {
  // Set initial status based on department to ensure proper routing
  const status = ChangeRequestStatus.PENDING_SUB_PMO;
  
  const changeRequestData = {
    ...data,
    id: uuidv4(),
    status,
    requestedAt: new Date().toISOString(),
    submissionDate: new Date().toISOString(),
    implemented: false
  };
  
  return makeRequest<ChangeRequest>('/change-requests', 'POST', changeRequestData, token);
};

/**
 * Get all change requests
 * @param token JWT token
 * @returns Promise<ApiResponse<ChangeRequest[]>>
 */
const getAllChangeRequests = async (token?: string): Promise<ApiResponse<ChangeRequest[]>> => {
  return makeRequest<ChangeRequest[]>('/change-requests', 'GET', null, token);
};

/**
 * Get change requests for a specific project
 * @param projectId Project ID
 * @param token JWT token
 * @returns Promise<ApiResponse<ChangeRequest[]>>
 */
const getProjectChangeRequests = async (projectId: string, token?: string): Promise<ApiResponse<ChangeRequest[]>> => {
  return makeRequest<ChangeRequest[]>(`/change-requests?projectId=${projectId}`, 'GET', null, token);
};

/**
 * Get change requests pending approval for a specific user based on their role and department
 * @param userRole User role
 * @param departmentId Department ID
 * @param token JWT token
 * @returns Promise<ApiResponse<ChangeRequest[]>>
 */
const getPendingChangeRequests = async (userRole: UserRole, departmentId: string, token?: string): Promise<ApiResponse<ChangeRequest[]>> => {
  let endpoint = '/change-requests?';
  
  if (userRole === UserRole.SUB_PMO) {
    // Sub PMO should only see requests from their department in PENDING_SUB_PMO status
    endpoint += `departmentId=${departmentId}&status=${ChangeRequestStatus.PENDING_SUB_PMO}`;
  } else if (userRole === UserRole.MAIN_PMO) {
    // Main PMO should see requests in PENDING_MAIN_PMO status from all departments
    endpoint += `status=${ChangeRequestStatus.PENDING_MAIN_PMO}`;
  } else if (userRole === UserRole.ADMIN) {
    // Admins can see all pending requests
    endpoint += `status=${ChangeRequestStatus.PENDING_SUB_PMO},${ChangeRequestStatus.PENDING_MAIN_PMO}`;
  }

  return makeRequest<ChangeRequest[]>(endpoint, 'GET', null, token);
};

/**
 * Get a specific change request by ID
 * @param changeRequestId Change request ID
 * @param token JWT token
 * @returns Promise<ApiResponse<ChangeRequest>>
 */
const getChangeRequestById = async (changeRequestId: string, token?: string): Promise<ApiResponse<ChangeRequest>> => {
  return makeRequest<ChangeRequest>(`/change-requests/${changeRequestId}`, 'GET', null, token);
};

/**
 * Update a change request's status
 * @param changeRequestId Change request ID
 * @param status New status
 * @param reviewerData Reviewer data
 * @param comments Review comments
 * @param token JWT token
 * @returns Promise<ApiResponse<ChangeRequest>>
 */
const updateChangeRequestStatus = async (
  changeRequestId: string, 
  status: ChangeRequestStatus, 
  reviewerData: { id: string; firstName: string; lastName: string; role: string },
  comments: string,
  token?: string
): Promise<ApiResponse<ChangeRequest>> => {
  const action = status === ChangeRequestStatus.APPROVED || status === ChangeRequestStatus.APPROVED_BY_SUB_PMO 
    ? 'APPROVE' 
    : status === ChangeRequestStatus.REJECTED || status === ChangeRequestStatus.REJECTED_BY_SUB_PMO 
      ? 'REJECT' 
      : 'REQUEST_CHANGES';
  
  const reviewData = {
    status,
    reviewHistory: {
      id: uuidv4(),
      action,
      comments,
      timestamp: new Date().toISOString(),
      reviewer: reviewerData
    },
    lastReviewedAt: new Date().toISOString()
  };
  
  // For approvals/rejections, set the appropriate fields
  if (status === ChangeRequestStatus.APPROVED) {
    Object.assign(reviewData, {
      approvedBy: {
        id: reviewerData.id,
        firstName: reviewerData.firstName,
        lastName: reviewerData.lastName
      },
      approvedAt: new Date().toISOString()
    });
  } else if (status === ChangeRequestStatus.REJECTED || status === ChangeRequestStatus.REJECTED_BY_SUB_PMO) {
    Object.assign(reviewData, {
      rejectedBy: {
        id: reviewerData.id,
        firstName: reviewerData.firstName,
        lastName: reviewerData.lastName
      },
      rejectedAt: new Date().toISOString(),
      rejectionReason: comments
    });
  } else if (status === ChangeRequestStatus.CHANGES_REQUESTED) {
    Object.assign(reviewData, {
      changesRequested: comments
    });
  }
  
  return makeRequest<ChangeRequest>(`/change-requests/${changeRequestId}`, 'PATCH', reviewData, token);
};

/**
 * Apply approved change request to the project
 * @param changeRequestId Change request ID
 * @param token JWT token
 * @returns Promise<ApiResponse<Project>>
 */
const applyChangeRequest = async (changeRequestId: string, token?: string): Promise<ApiResponse<Project>> => {
  // First, get the change request
  const changeRequestResponse = await getChangeRequestById(changeRequestId, token);
  
  if (!changeRequestResponse.success || !changeRequestResponse.data) {
    return {
      success: false,
      error: 'Failed to fetch change request'
    };
  }
  
  const changeRequest = changeRequestResponse.data;
  
  // Only apply if the change request is approved
  if (changeRequest.status !== ChangeRequestStatus.APPROVED) {
    return {
      success: false,
      error: 'Change request is not approved'
    };
  }
  
  // Get the project
  const projectResponse = await makeRequest<Project>(`/projects/${changeRequest.projectId}`, 'GET', null, token);
  
  if (!projectResponse.success || !projectResponse.data) {
    return {
      success: false,
      error: 'Failed to fetch project'
    };
  }
  
  const project = projectResponse.data;
  
  // Apply changes based on the change request type
  const updatedProject = { ...project };
  
  switch (changeRequest.type) {
    case ChangeRequestType.SCHEDULE:
      if (changeRequest.newEndDate) {
        updatedProject.endDate = changeRequest.newEndDate;
      }
      break;
    
    case ChangeRequestType.BUDGET:
      if (changeRequest.newBudget !== undefined) {
        updatedProject.budget = changeRequest.newBudget;
      }
      break;
    
    case ChangeRequestType.STATUS:
      if (changeRequest.newStatus) {
        updatedProject.status = changeRequest.newStatus as ProjectStatus;
      }
      break;
    
    // Additional cases for other change types
    case ChangeRequestType.RESOURCE:
      // Handle resource changes
      break;
    
    case ChangeRequestType.SCOPE:
      // Handle scope changes - this might update the description or other scope-related fields
      break;
    
    case ChangeRequestType.CLOSURE:
      // Handle project closure request - might set status to COMPLETED
      updatedProject.status = ProjectStatus.COMPLETED;
      break;
  }
  
  // Update the project
  const updateResponse = await makeRequest<Project>(
    `/projects/${project.id}`, 
    'PUT', 
    updatedProject, 
    token
  );
  
  if (updateResponse.success) {
    // Mark the change request as implemented
    await makeRequest<ChangeRequest>(
      `/change-requests/${changeRequest.id}`, 
      'PATCH', 
      { 
        implemented: true,
        implementedAt: new Date().toISOString()
      }, 
      token
    );
  }
  
  return updateResponse;
};

const changeRequestService = {
  createChangeRequest,
  getAllChangeRequests,
  getProjectChangeRequests,
  getPendingChangeRequests,
  getChangeRequestById,
  updateChangeRequestStatus,
  applyChangeRequest
};

export default changeRequestService; 