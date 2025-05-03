import apiRoutes from './api';

// Define the enums here to avoid import issues
export enum ChangeRequestType {
  SCHEDULE = 'SCHEDULE',
  BUDGET = 'BUDGET',
  SCOPE = 'SCOPE',
  RESOURCE = 'RESOURCE',
  CLOSURE = 'CLOSURE',
  OTHER = 'OTHER'
}

export enum ChangeRequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  IMPLEMENTED = 'IMPLEMENTED'
}

// Define the interface here
export interface ChangeRequest {
  id: string;
  projectId: string;
  title: string;
  description: string;
  type: ChangeRequestType;
  status: ChangeRequestStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  reviewedBy?: string;
  reviewNotes?: string;
  attachments?: string[];
  // Additional fields based on type
  schedule?: {
    currentEndDate: string;
    proposedEndDate: string;
    justification: string;
  };
  budget?: {
    currentBudget: number;
    proposedBudget: number;
    justification: string;
  };
  scope?: {
    currentScope: string;
    proposedScope: string;
    justification: string;
  };
  resource?: {
    requiredResources: string;
    justification: string;
  };
}

export interface ChangeRequestCreateParams {
  title: string;
  description: string;
  projectId: string;
  type: ChangeRequestType;
  impactDescription: string;
  requestedBy: string;
  schedule?: {
    newEndDate: Date;
    reason: string;
  };
  budget?: {
    additionalBudget: number;
    reason: string;
  };
  resource?: {
    resourcesNeeded: string;
    reason: string;
  };
  scope?: {
    newScope: string;
    reason: string;
  };
  closure?: {
    reason: string;
  };
  attachments?: File[];
}

class ChangeRequestService {
  getChangeRequestsByProject = async (projectId: string): Promise<ChangeRequest[]> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('User not authenticated');
      
      const response = await apiRoutes.changeRequests.getChangeRequestsByProject(projectId, token);
      return response.data;
    } catch (error) {
      console.error('Error fetching change requests:', error);
      throw error;
    }
  };

  getChangeRequestById = async (requestId: string): Promise<ChangeRequest> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('User not authenticated');
      
      const response = await apiRoutes.changeRequests.getChangeRequestById(requestId, token);
      return response.data;
    } catch (error) {
      console.error('Error fetching change request details:', error);
      throw error;
    }
  };

  createChangeRequest = async (requestData: ChangeRequestCreateParams): Promise<ChangeRequest> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('User not authenticated');
      
      // Convert to form data if there are attachments
      let payload: any = requestData;
      if (requestData.attachments && requestData.attachments.length > 0) {
        const formData = new FormData();
        Object.keys(requestData).forEach(key => {
          if (key !== 'attachments') {
            if (typeof requestData[key as keyof ChangeRequestCreateParams] === 'object' && 
                requestData[key as keyof ChangeRequestCreateParams] !== null) {
              formData.append(key, JSON.stringify(requestData[key as keyof ChangeRequestCreateParams]));
            } else {
              formData.append(key, String(requestData[key as keyof ChangeRequestCreateParams]));
            }
          }
        });
        
        requestData.attachments.forEach(file => {
          formData.append('attachments', file);
        });
        
        payload = formData;
      }
      
      const response = await apiRoutes.changeRequests.createChangeRequest(payload, token);
      return response.data;
    } catch (error) {
      console.error('Error creating change request:', error);
      throw error;
    }
  };

  updateChangeRequestStatus = async (
    requestId: string, 
    status: ChangeRequestStatus, 
    reviewNotes?: string
  ): Promise<ChangeRequest> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('User not authenticated');
      
      const response = await apiRoutes.changeRequests.updateChangeRequestStatus(
        requestId, 
        status, 
        reviewNotes, 
        token
      );
      return response.data;
    } catch (error) {
      console.error('Error updating change request status:', error);
      throw error;
    }
  };

  approveChangeRequest = async (requestId: string, reviewNotes?: string): Promise<ChangeRequest> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('User not authenticated');
      
      const response = await apiRoutes.changeRequests.approveChangeRequest(requestId, reviewNotes, token);
      return response.data;
    } catch (error) {
      console.error('Error approving change request:', error);
      throw error;
    }
  };

  rejectChangeRequest = async (requestId: string, reviewNotes: string): Promise<ChangeRequest> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('User not authenticated');
      
      const response = await apiRoutes.changeRequests.rejectChangeRequest(requestId, reviewNotes, token);
      return response.data;
    } catch (error) {
      console.error('Error rejecting change request:', error);
      throw error;
    }
  };
}

export default new ChangeRequestService(); 