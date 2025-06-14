import axios from 'axios';

// Define base URL for API - can be moved to .env file later
const API_URL = 'http://localhost:8080/api/auth/';

// Define user type
export interface User {
  id?: number;
  username: string;
  email?: string;
  roles?: string[];
}

// Define authentication response
export interface AuthResponse {
  token: string;
  type: string;
  id: number;
  username: string;
  email: string;
  roles: string[];
}

// Login function
export const login = async (username: string, password: string): Promise<User> => {
  try {
    const response = await axios.post<AuthResponse>(API_URL + 'signin', {
      username,
      password,
    });
    
    if (response.data.token) {
      // Store user data in localStorage
      localStorage.setItem('user', JSON.stringify({
        id: response.data.id,
        username: response.data.username,
        email: response.data.email,
        roles: response.data.roles,
      }));
      
      // Store token separately
      localStorage.setItem('token', response.data.token);
    }
    
    return {
      id: response.data.id,
      username: response.data.username,
      email: response.data.email,
      roles: response.data.roles,
    };
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

// Register function
export const register = async (username: string, email: string, password: string): Promise<any> => {
  try {
    return await axios.post(API_URL + 'signup', {
      username,
      email,
      password,
    });
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

// Logout function
export const logout = (): void => {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
};

// Get current user
export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    return JSON.parse(userStr);
  }
  return null;
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return localStorage.getItem('token') !== null;
};

// Get auth token
export const getToken = (): string | null => {
  return localStorage.getItem('token');
};

// Auth header for axios
export const authHeader = (): Record<string, string> => {
  const token = getToken();
  
  if (token) {
    return { Authorization: 'Bearer ' + token };
  } else {
    return {};
  }
};
