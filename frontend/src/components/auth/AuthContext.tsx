import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User, getCurrentUser, login as authLogin, logout as authLogout, register as authRegister } from '../../services/authService';
import { setTokenExpirationHandler } from '../../services/api';

// Define the shape of our context
interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  handleTokenExpiration: () => void;
  isAuthenticated: boolean;
}

// Create the context with a default value
export const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  loading: false,
  error: null,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  handleTokenExpiration: () => {},
  isAuthenticated: false,
});

// Props for the provider component
interface AuthProviderProps {
  children: ReactNode;
}

// Create a provider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  // Handle token expiration
  const handleTokenExpiration = useCallback(() => {
    authLogout();
    setCurrentUser(null);
    setIsAuthenticated(false);
    setError('Session expired. Please log in again.');
  }, []);

  // Check for existing user session on component mount
  useEffect(() => {
    // Set up the token expiration handler
    setTokenExpirationHandler(handleTokenExpiration);
    
    const user = getCurrentUser();
    const token = localStorage.getItem('token');
    
    if (user && token) {
      // Trust the stored session initially, let API calls handle invalid tokens
      setCurrentUser(user);
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, [handleTokenExpiration]);
  // Login function
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const user = await authLogin(email, password);
      setCurrentUser(user);
      setIsAuthenticated(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to login');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (username: string, email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      await authRegister(username, email, password);
      // Note: We don't automatically log in after registration
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to register');
      throw err;
    } finally {
      setLoading(false);
    }
  };  // Logout function
  const logout = () => {
    authLogout();
    setCurrentUser(null);
    setIsAuthenticated(false);
  };
  // Value to be provided to consumers
  const value = {
    currentUser,
    loading,
    error,
    login,
    register,
    logout,
    handleTokenExpiration,
    isAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook for using auth context
export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
