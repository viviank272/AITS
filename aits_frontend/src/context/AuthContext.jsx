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
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Function to validate user data
  const isValidUser = (userData) => {
    return userData && 
           typeof userData === 'object' && 
           userData.role && 
           userData.email;
  };

  // Function to update user state and handle navigation
  const updateUserState = (newUser) => {
    console.log('AuthContext - updating user state:', newUser);
    if (isValidUser(newUser)) {
      console.log('AuthContext - setting valid user state');
      setUser(newUser);
      // Navigate based on role
      if (newUser.role === 'student') {
        console.log('AuthContext - navigating to student dashboard');
        navigate('/student');
      } else if (newUser.role === 'lecturer') {
        console.log('AuthContext - navigating to lecturer dashboard');
        navigate('/lecturer');
      } else if (newUser.role === 'admin') {
        console.log('AuthContext - navigating to admin dashboard');
        navigate('/admin');
      }
    } else {
      console.log('AuthContext - invalid user data:', newUser);
      setUser(null);
      navigate('/login');
    }
  };

  // Check for existing user data and token on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('access');
    const role = localStorage.getItem('selectedRole');

    console.log('AuthContext mount - stored data:', {
      storedUser,
      token,
      role
    });

    if (storedUser && token && role) {
      try {
        // Parse user data to ensure it's an object
        const parsedUser = typeof storedUser === 'string' ? JSON.parse(storedUser) : storedUser;
        
        console.log('AuthContext - parsed user:', parsedUser);
        
        // Ensure the user's role matches the selected role
        if (parsedUser.role === role && isValidUser(parsedUser)) {
          console.log('AuthContext - setting user state:', parsedUser);
          setUser(parsedUser);
        } else {
          // Clear invalid data if roles don't match or user is invalid
          console.log('Role mismatch or invalid user data, clearing auth data');
          localStorage.removeItem('user');
          localStorage.removeItem('access');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('selectedRole');
          setUser(null);
        }
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        // Clear invalid data
        localStorage.removeItem('user');
        localStorage.removeItem('access');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('selectedRole');
        setUser(null);
      }
    } else {
      console.log('AuthContext - no stored data found');
      setUser(null);
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      // Clear any existing auth data before attempting new login
      localStorage.removeItem('access');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      localStorage.removeItem('selectedRole');
      setUser(null); // Clear user state immediately
      
      console.log('AuthContext - sending login request with credentials:', credentials);
      const response = await apiLogin(credentials);
      console.log('AuthContext - login response:', response);
      
      const { access, refresh, user: userData } = response;
      
      if (!access || !userData) {
        throw new Error('Invalid login response');
      }
      
      // Parse user data to ensure it's an object
      const parsedUserData = typeof userData === 'string' ? JSON.parse(userData) : userData;
      
      console.log('AuthContext - parsed user data:', parsedUserData);
      
      if (!isValidUser(parsedUserData)) {
        throw new Error('Invalid user data received from server');
      }
      
      // Store tokens and user data
      localStorage.setItem('access', access);
      localStorage.setItem('refreshToken', refresh);
      localStorage.setItem('user', JSON.stringify(parsedUserData));
      localStorage.setItem('selectedRole', parsedUserData.role);
      
      // Update context state and handle navigation
      console.log('AuthContext - setting user state:', parsedUserData);
      updateUserState(parsedUserData);
      
      return parsedUserData;
    } catch (error) {
      console.error('Login error:', error);
      // Clear auth data on login failure
      localStorage.removeItem('access');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      localStorage.removeItem('selectedRole');
      setUser(null);
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
      
      setUser(null); // Reset user state immediately
      
      // Navigate to landing page
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if the backend call fails, we should still clear local data and redirect
      localStorage.removeItem('access');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      localStorage.removeItem('selectedRole');
      setUser(null); // Reset user state immediately
      navigate('/');
    }
  };

  const value = {
    user,
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