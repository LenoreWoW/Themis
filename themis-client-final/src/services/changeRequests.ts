import { ApiResponse } from '../types';
import { ChangeRequest, ChangeRequestType, ChangeRequestStatus, ChangeRequestSubmitData } from '../types/change-request';
import { v4 as uuidv4 } from 'uuid';

// Immediate self-executing function to clean up localStorage on application load
(function cleanupChangeRequests() {
  console.log('Running automatic cleanup of change requests data...');
  try {
    // Remove the existing data completely
    localStorage.removeItem('changeRequests');
    // Initialize with empty array
    localStorage.setItem('changeRequests', JSON.stringify([]));
    console.log('Change requests data reset successfully');
  } catch (error) {
    console.error('Error cleaning up change requests:', error);
  }
})();

// Mock implementation for demo purposes
const submitChangeRequest = async (data: ChangeRequestSubmitData, token: string): Promise<ApiResponse<ChangeRequest>> => {
  // In a real app, this would call the API
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockResponse: ChangeRequest = {
        id: uuidv4(),
        projectId: data.projectId,
        type: data.type,
        description: data.description,
        justification: data.justification,
        newEndDate: data.newEndDate,
        newBudget: data.newBudget,
        newStatus: data.newStatus,
        newManager: data.newManager,
        documentsAffected: data.documentsAffected,
        requestedBy: {
          id: "user123",
          firstName: "John",
          lastName: "Doe"
        },
        requestedAt: new Date().toISOString(),
        status: ChangeRequestStatus.PENDING_SUB_PMO,
        department: {
          id: "dept123",
          name: "IT Department"
        },
        implemented: false
      };
      
      // Store the new change request in localStorage
      try {
        // Get existing change requests
        const existingData = localStorage.getItem('changeRequests');
        let existingRequests = [];
        
        if (existingData) {
          existingRequests = JSON.parse(existingData);
          // Ensure it's an array
          if (!Array.isArray(existingRequests)) {
            existingRequests = [];
          }
        }
        
        // Add the new request
        existingRequests.push(mockResponse);
        
        // Save back to localStorage
        localStorage.setItem('changeRequests', JSON.stringify(existingRequests));
        console.log('Change request saved to localStorage:', mockResponse);
      } catch (error) {
        console.error('Error saving change request to localStorage:', error);
      }
      
      resolve({
        success: true,
        message: 'Change request submitted successfully',
        data: mockResponse
      });
    }, 1000);
  });
};

// Get all change requests (real implementation using localStorage)
const getAllChangeRequests = async (token: string): Promise<ApiResponse<ChangeRequest[]>> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Get real change requests from localStorage
      const changeRequestsData = localStorage.getItem('changeRequests');
      let changeRequests = [];
      
      try {
        // Handle case when changeRequests is null or undefined
        if (!changeRequestsData) {
          console.warn('No changeRequests found in localStorage, initializing empty array');
          localStorage.setItem('changeRequests', JSON.stringify([]));
          
          resolve({
            success: true,
            message: 'Change requests initialized with empty array',
            data: []
          });
          return;
        }
        
        // Attempt to parse the data
        changeRequests = JSON.parse(changeRequestsData);
        
        // Validate the structure
        if (!Array.isArray(changeRequests)) {
          console.warn('Retrieved changeRequests is not an array, resetting to empty array');
          changeRequests = [];
          localStorage.setItem('changeRequests', JSON.stringify([]));
        }
        
        // Further validation of each change request object
        const validChangeRequests = changeRequests.filter(req => {
          const isValid = 
            req && 
            typeof req === 'object' && 
            typeof req.id === 'string' &&
            typeof req.projectId === 'string' &&
            typeof req.type === 'string' &&
            typeof req.status === 'string';
            
          if (!isValid) {
            console.warn('Found invalid change request in localStorage, filtering it out:', req);
          }
          
          return isValid;
        });
        
        // If we filtered out invalid items, update localStorage
        if (validChangeRequests.length !== changeRequests.length) {
          console.warn(`Filtered out ${changeRequests.length - validChangeRequests.length} invalid change requests`);
          localStorage.setItem('changeRequests', JSON.stringify(validChangeRequests));
          changeRequests = validChangeRequests;
        }
        
        console.log('Retrieved change requests from localStorage:', changeRequests);
      } catch (error) {
        console.error('Error parsing change requests from localStorage:', error);
        changeRequests = [];
        // Reset localStorage to a valid state
        localStorage.setItem('changeRequests', JSON.stringify([]));
      }
      
      resolve({
        success: true,
        message: 'Change requests retrieved successfully',
        data: changeRequests
      });
    }, 500);
  });
};

// Get change requests by project (using real localStorage data)
const getChangeRequestsByProject = async (projectId: string, token: string): Promise<ApiResponse<ChangeRequest[]>> => {
  // Get all requests from localStorage and filter by project
  const allRequests = await getAllChangeRequests(token);
  
  if (allRequests.success && allRequests.data) {
    const projectRequests = allRequests.data.filter(request => request.projectId === projectId);
    return {
      success: true,
      message: 'Change requests retrieved successfully',
      data: projectRequests
    };
  }
  
  return {
    success: false,
    message: 'Failed to retrieve change requests',
    data: []
  };
};

// Approve a change request (real implementation using localStorage)
const approveChangeRequest = async (
  requestId: string, 
  approverId: string, 
  approverName: string, 
  isFinalApproval: boolean,
  notes: string,
  token: string
): Promise<ApiResponse<ChangeRequest>> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      try {
        // Get all change requests from localStorage
        const changeRequestsData = localStorage.getItem('changeRequests');
        let changeRequests = [];
        
        if (!changeRequestsData) {
          resolve({
            success: false,
            message: 'No change requests found',
            data: null
          });
          return;
        }
        
        // Parse the data
        changeRequests = JSON.parse(changeRequestsData);
        
        // Validate data is an array
        if (!Array.isArray(changeRequests)) {
          resolve({
            success: false,
            message: 'Invalid change requests data format',
            data: null
          });
          return;
        }
        
        // Find the specific change request to approve
        const requestIndex = changeRequests.findIndex((req: ChangeRequest) => req.id === requestId);
        
        if (requestIndex >= 0) {
          // Update the change request status
          changeRequests[requestIndex] = {
            ...changeRequests[requestIndex],
            status: 'APPROVED',
            approvedBy: {
              id: approverId,
              firstName: approverName.split(' ')[0],
              lastName: approverName.split(' ')[1] || ''
            },
            approvedAt: new Date().toISOString(),
            finalApproval: isFinalApproval
          };
          
          // Save the updated requests back to localStorage
          localStorage.setItem('changeRequests', JSON.stringify(changeRequests));
          
          resolve({
            success: true,
            message: 'Change request approved successfully',
            data: changeRequests[requestIndex]
          });
        } else {
          resolve({
            success: false,
            message: 'Change request not found',
            data: null
          });
        }
      } catch (error) {
        console.error('Error processing change request approval:', error);
        resolve({
          success: false,
          message: 'Error processing change request approval',
          data: null
        });
      }
    }, 500);
  });
};

// Reject a change request (real implementation using localStorage)
const rejectChangeRequest = async (
  requestId: string, 
  rejecterId: string, 
  rejecterName: string, 
  rejectionReason: string,
  token: string
): Promise<ApiResponse<ChangeRequest>> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      try {
        // Get all change requests from localStorage
        const changeRequestsData = localStorage.getItem('changeRequests');
        let changeRequests = [];
        
        if (!changeRequestsData) {
          resolve({
            success: false,
            message: 'No change requests found',
            data: null
          });
          return;
        }
        
        // Parse the data
        changeRequests = JSON.parse(changeRequestsData);
        
        // Validate data is an array
        if (!Array.isArray(changeRequests)) {
          resolve({
            success: false,
            message: 'Invalid change requests data format',
            data: null
          });
          return;
        }
        
        // Find the specific change request to reject
        const requestIndex = changeRequests.findIndex((req: ChangeRequest) => req.id === requestId);
        
        if (requestIndex >= 0) {
          // Update the change request status
          changeRequests[requestIndex] = {
            ...changeRequests[requestIndex],
            status: 'REJECTED',
            rejectedBy: {
              id: rejecterId,
              firstName: rejecterName.split(' ')[0],
              lastName: rejecterName.split(' ')[1] || ''
            },
            rejectedAt: new Date().toISOString(),
            rejectionReason: rejectionReason
          };
          
          // Save the updated requests back to localStorage
          localStorage.setItem('changeRequests', JSON.stringify(changeRequests));
          
          resolve({
            success: true,
            message: 'Change request rejected successfully',
            data: changeRequests[requestIndex]
          });
        } else {
          resolve({
            success: false,
            message: 'Change request not found',
            data: null
          });
        }
      } catch (error) {
        console.error('Error processing change request rejection:', error);
        resolve({
          success: false,
          message: 'Error processing change request rejection',
          data: null
        });
      }
    }, 500);
  });
};

export default {
  submitChangeRequest,
  getAllChangeRequests,
  getChangeRequestsByProject,
  approveChangeRequest,
  rejectChangeRequest
}; 