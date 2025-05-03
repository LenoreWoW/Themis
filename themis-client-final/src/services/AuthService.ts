/**
 * Simple authentication service
 */
const AuthService = {
  getToken: (): string => {
    return localStorage.getItem('token') || '';
  },
  
  setToken: (token: string): void => {
    localStorage.setItem('token', token);
  },
  
  clearToken: (): void => {
    localStorage.removeItem('token');
  },
  
  isAuthenticated: (): boolean => {
    return !!AuthService.getToken();
  }
};

export default AuthService; 