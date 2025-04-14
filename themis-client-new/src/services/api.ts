import { AuthResponse } from '../types';

const API_URL = 'http://localhost:5065/api';

export const login = async (adIdentifier: string): Promise<AuthResponse> => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ adIdentifier }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to login');
  }

  return response.json();
}; 