import axios from 'axios';
import { authHeader } from './authService';

// Create an axios instance with default config
const API = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Store reference to auth context handler (will be set by AuthContext)
let tokenExpirationHandler: (() => void) | null = null;

export const setTokenExpirationHandler = (handler: () => void) => {
  tokenExpirationHandler = handler;
};

// Add a request interceptor to attach auth token to all requests
API.interceptors.request.use(
  (config) => {
    // Add auth header to config if available
    const headers = authHeader();
    if (headers.Authorization) {
      config.headers.Authorization = headers.Authorization;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
API.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized errors (token expired)
    if (error.response && error.response.status === 401) {
      // Use the token expiration handler if available, otherwise fallback to redirect
      if (tokenExpirationHandler) {
        tokenExpirationHandler();
      } else {
        // Fallback: clear storage and redirect to login
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default API;
