import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as apiLogin, register as apiRegister, logout as apiLogout } from '../services/api';

export const AuthContext = createContext(null);

/**
 * Authentication provider component
 * Manages the global authentication state
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for existing user data and token on mount
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('access');

    if (storedUser && token) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setIsAuthenticated(true);
        console.log('User authenticated from localStorage:', userData);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        setIsAuthenticated(false);
      }
    } else {
      setIsAuthenticated(false);
    }

    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      const response = await apiLogin(credentials);
      console.log('Login response:', response);
      
      const { token, refresh_token, user: userData } = response;
      
      // Store token and user data
      if (token) {
        localStorage.setItem('access', token);
        console.log('Access token stored:', token);
      } else {
        console.error('No access token in response');
        throw new Error('No access token received');
      }
      
      if (refresh_token) {
        localStorage.setItem('refreshToken', refresh_token);
      }
      
      if (userData) {
        localStorage.setItem('user', JSON.stringify(userData));
      }

      // Update context state
      setUser(userData);
      setIsAuthenticated(true);

      return userData;
    } catch (error) {
      console.error('Login error:', error);
      setIsAuthenticated(false);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await apiRegister(userData);
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to register');
    }
  };

  const logout = async () => {
    try {
      // Get refresh token from localStorage
      const refreshToken = localStorage.getItem('refreshToken');
      
      // Call backend logout endpoint
      await apiLogout(refreshToken);
      
      // Clear all stored data
      localStorage.removeItem('access');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      localStorage.removeItem('selectedRole');
      
      setUser(null);
      setIsAuthenticated(false);
      
      // Navigate to landing page
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if the backend call fails, we should still clear local data and redirect
      localStorage.removeItem('access');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      localStorage.removeItem('selectedRole');
      setUser(null);
      setIsAuthenticated(false);
      navigate('/');
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};