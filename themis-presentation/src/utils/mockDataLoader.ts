import { saveMockDataToLocalStorage } from '../mockDataGenerator';

// This function checks if mock data exists and loads it if needed
export const ensureMockDataLoaded = () => {
  // Check if mock data is already loaded
  if (!localStorage.getItem('mockUsers') || !localStorage.getItem('mockProjects')) {
    console.log('Mock data not found, generating fresh data for presentation...');
    saveMockDataToLocalStorage();
    
    // Add a mock data loaded flag with timestamp
    localStorage.setItem('mockDataLoaded', new Date().toISOString());
    return true;
  }
  
  console.log('Mock data already exists in localStorage');
  return false;
};

// This function gets the user ID to use for the "current user"
export const getCurrentMockUser = () => {
  // Get mock users
  const mockUsers = JSON.parse(localStorage.getItem('mockUsers') || '[]');
  
  // Try to find a user with ADMIN role for demo purposes
  const adminUser = mockUsers.find((user: any) => user.role === 'ADMIN');
  
  // If admin found, return it, otherwise return the first user or null
  return adminUser || (mockUsers.length > 0 ? mockUsers[0] : null);
};

// Map the mock data to the expected format for the app's existing hooks/contexts
export const mapMockDataToAppData = () => {
  // Get all mock data
  const mockUsers = JSON.parse(localStorage.getItem('mockUsers') || '[]');
  const mockProjects = JSON.parse(localStorage.getItem('mockProjects') || '[]');
  const mockTasks = JSON.parse(localStorage.getItem('mockTasks') || '[]');
  
  // Store mapped data in app-expected format
  localStorage.setItem('users', JSON.stringify(mockUsers));
  localStorage.setItem('projects', JSON.stringify(mockProjects));
  localStorage.setItem('tasks', JSON.stringify(mockTasks));
};

// Initialize mock data on app load
export const initializeMockData = () => {
  // Generate and load mock data if needed
  const freshDataGenerated = ensureMockDataLoaded();
  
  // Map mock data to app-expected format
  mapMockDataToAppData();
  
  // Return a user to sign in with
  return getCurrentMockUser();
}; 