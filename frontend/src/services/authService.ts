import axios from 'axios';

// Define base URL for API - can be moved to .env file later
const API_URL = 'http://localhost:8080/api/auth/';

// Define user type
export interface User {
  id?: number;
  name: string;
  email?: string;
  role?: string;
}

// Define authentication response
export interface AuthResponse {
  id: number;
  name: string;
  email: string;
  role: string;
}

// Login function
export const login = async (email: string, password: string): Promise<User> => {
  try {
    // Using basic auth with the email and password
    const response = await axios.post<User>(API_URL + 'login', {
      email: email, // using email as the login identifier
      password,
    });
    
    // Store user data in localStorage
    localStorage.setItem('user', JSON.stringify(response.data));
      // Create a basic auth token and store it
    const token = btoa(`${email}:${password}`); // base64 encode
    localStorage.setItem('token', token);
    
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

// Register function
export const register = async (username: string, email: string, password: string): Promise<any> => {
  try {
    return await axios.post(API_URL + 'register', {
      name: username, // backend expects 'name' field instead of 'username'
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
    return { Authorization: 'Basic ' + token };
  } else {
    return {};
  }
};
