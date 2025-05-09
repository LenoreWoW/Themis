import { AuthResponse, ApiResponse, User, UserRole } from '../types';
import axios from 'axios';
import { API_BASE_URL, AUTH0_CONFIG } from '../config';
import auth0 from 'auth0-js';

// Helper function to make API requests
const makeRequest = async <T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  data?: any,
  token?: string
): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await axios({
      method,
      url,
      data,
      headers,
    });

    return response.data as T;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'An error occurred');
    }
    throw error;
  }
};

// Initialize Auth0 WebAuth client
const auth0Client = new auth0.WebAuth({
  domain: AUTH0_CONFIG.DOMAIN,
  clientID: AUTH0_CONFIG.CLIENT_ID,
  redirectUri: AUTH0_CONFIG.REDIRECT_URI,
  audience: AUTH0_CONFIG.AUDIENCE,
  responseType: 'token id_token',
  scope: AUTH0_CONFIG.SCOPE
});

// Login function using Auth0
export const loginWithAuth0 = (): void => {
  auth0Client.authorize();
};

// Process authentication result from Auth0 redirect
export const handleAuth0Authentication = (): Promise<AuthResponse> => {
  return new Promise((resolve, reject) => {
    auth0Client.parseHash((err, authResult) => {
      if (err) {
        reject(new Error(err.error_description || 'Authentication failed'));
        return;
      }
      
      if (!authResult || !authResult.accessToken || !authResult.idToken) {
        reject(new Error('Authentication failed'));
        return;
      }
      
      // Get user info
      auth0Client.client.userInfo(authResult.accessToken, async (err, user) => {
        if (err) {
          reject(new Error('Failed to get user information'));
          return;
        }
        
        try {
          // Send auth0 token to backend to create/login user
          const response = await makeRequest<AuthResponse>(
            '/auth/auth0',
            'POST',
            {
              auth0Id: user.sub,
              email: user.email,
              name: user.name,
              picture: user.picture
            }
          );
          
          // Store tokens
          localStorage.setItem('access_token', authResult.accessToken);
          localStorage.setItem('id_token', authResult.idToken);
          localStorage.setItem('expires_at', String(authResult.expiresIn * 1000 + new Date().getTime()));
          
          resolve(response);
        } catch (error) {
          reject(error);
        }
      });
    });
  });
};

// Check if user is authenticated with Auth0
export const isAuthenticated = (): boolean => {
  const expiresAt = JSON.parse(localStorage.getItem('expires_at') || '0');
  return new Date().getTime() < expiresAt;
};

// Logout from Auth0
export const logoutAuth0 = (): void => {
  // Clear local storage
  localStorage.removeItem('access_token');
  localStorage.removeItem('id_token');
  localStorage.removeItem('expires_at');
  
  // Redirect to Auth0 logout page
  auth0Client.logout({
    returnTo: window.location.origin
  });
};

// Legacy login function (will be deprecated once Auth0 is fully integrated)
export const login = async (username: string, password: string): Promise<AuthResponse> => {
  try {
    // Special handling for test accounts - bypass validation
    const testAccounts = [
      'admin',
      'john.smith@acme.com',
      'sarah.johnson@acme.com',
      'emma.garcia@acme.com',
      'robert.taylor@acme.com',
      'david.wilson@acme.com',
      'jessica.brown@acme.com',
      'michael.chen@acme.com'
    ];
    
    if (testAccounts.includes(username.toLowerCase())) {
      console.log('Using test account auto-validation for:', username);
      
      // Create a mock successful response for the test account
      const mockUser: User = {
        id: 'test-user-' + Date.now(),
        username: username,
        firstName: username.split('@')[0].split('.')[0],
        lastName: username.split('@')[0].split('.')[1] || '',
        email: username,
        role: username.toLowerCase() === 'admin' ? UserRole.ADMIN : 
              username.toLowerCase().includes('manager') ? UserRole.PROJECT_MANAGER :
              username.toLowerCase().includes('director') ? UserRole.DEPARTMENT_DIRECTOR :
              username.toLowerCase().includes('executive') ? UserRole.EXECUTIVE :
              username.toLowerCase().includes('main') ? UserRole.MAIN_PMO :
              username.toLowerCase().includes('sub') ? UserRole.SUB_PMO :
              UserRole.DEVELOPER,
        department: {
          id: 'dept-' + Math.floor(Math.random() * 10),
          name: username.includes('digital') ? 'Digital Transformation' :
                username.includes('finance') ? 'Finance Department' :
                username.includes('dev') ? 'Development Department' : 'IT Department',
          description: 'Department for ' + username,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Mock successful response
      return {
        userId: mockUser.id,
        username: mockUser.username,
        role: mockUser.role,
        departmentId: mockUser.department.id,
        token: 'test-token-' + Date.now(),
        success: true,
        message: 'Test account login successful',
        user: mockUser
      };
    }
    
    // For real accounts, try LDAP authentication first
    console.log('Attempting LDAP authentication for:', username);
    return await makeRequest<AuthResponse>('/auth/ldap/login', 'POST', { username, password });
  } catch (error) {
    console.log('LDAP authentication failed, falling back to regular auth');
    
    // If LDAP authentication fails, try regular authentication
    try {
      return await makeRequest<AuthResponse>('/auth/login', 'POST', { email: username, password });
    } catch (secondError) {
      console.error('Both LDAP and regular authentication failed');
      throw new Error('Authentication failed. Please check your credentials and try again.');
    }
  }
};

// Legacy registration function (will be deprecated once Auth0 is fully integrated)
export const register = async (userData: Partial<User>): Promise<User> => {
  return makeRequest<User>('/auth/register', 'POST', userData);
};

// Logout (legacy, will be deprecated)
export const logout = async (token?: string): Promise<void> => {
  if (token) {
    await makeRequest<void>('/auth/logout', 'POST', {}, token);
  }
};

// Function to refresh token
export const refreshToken = async (refreshToken: string): Promise<AuthResponse> => {
  return makeRequest<AuthResponse>('/auth/refresh-token', 'POST', { refreshToken });
};

// Function to send password reset email
export const resetPassword = async (email: string): Promise<void> => {
  return makeRequest<void>('/auth/reset-password', 'POST', { email });
};

// User request management functions
export const createUserRequest = async (userRequest: any, token: string): Promise<any> => {
  return makeRequest<any>('/auth/user-requests', 'POST', userRequest, token);
};

export const getUserRequests = async (token: string): Promise<any[]> => {
  return makeRequest<any[]>('/auth/user-requests', 'GET', undefined, token);
};

export const getUserRequestById = async (id: string, token: string): Promise<any> => {
  return makeRequest<any>(`/auth/user-requests/${id}`, 'GET', undefined, token);
};

export const updateUserRequest = async (id: string, userRequest: any, token: string): Promise<any> => {
  return makeRequest<any>(`/auth/user-requests/${id}`, 'PUT', userRequest, token);
};

export const approveUserRequest = async (id: string, comments: string, token: string): Promise<any> => {
  return makeRequest<any>(`/auth/user-requests/${id}/approve`, 'POST', { comments }, token);
};

export const rejectUserRequest = async (id: string, comments: string, token: string): Promise<any> => {
  return makeRequest<any>(`/auth/user-requests/${id}/reject`, 'POST', { comments }, token);
};

export const getCurrentUser = async (token: string): Promise<ApiResponse<User>> => {
  // In a real implementation, this would call an API endpoint to get the current user
  // For now, simulate a response after a short delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Create a mock user response
  const mockUser: User = {
    id: 'current-user',
    username: 'current.user',
    firstName: 'Current',
    lastName: 'User',
    email: 'current.user@example.com',
    role: UserRole.ADMIN, // Default to admin for testing
    department: {
      id: 'dept-1',
      name: 'IT Department',
      description: 'Information Technology Department',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  return {
    data: mockUser,
    success: true
  };
};

// Make sure to export default for the main auth object
const auth = {
  login,
  refreshToken,
  logout,
  getCurrentUser,
  // other methods...
};

export default auth; 