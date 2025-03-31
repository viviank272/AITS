import { useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

/**
 * Custom hook for authentication functionality
 * Provides methods and state for user authentication
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  const navigate = useNavigate();
  
  // If the context doesn't exist, it means the hook is being used outside of an AuthProvider
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  const { user, setUser } = context;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Check if user is authenticated
  const isAuthenticated = Boolean(user);
  
  // Get user token from localStorage
  const getToken = useCallback(() => {
    return localStorage.getItem('authToken');
  }, []);
  
  // Set token to localStorage
  const setToken = useCallback((token) => {
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }
  }, []);
  
  // Login function
  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      // In a real app, this would be an API call
      // For demo purposes, we'll simulate a successful login for specific credentials
      if (email === 'student@example.com' && password === 'password') {
        const userData = {
          id: '1',
          name: 'John Student',
          email: 'student@example.com',
          role: 'student',
          department: 'Computer Science'
        };
        const token = 'demo-student-token';
        
        setUser(userData);
        setToken(token);
        setLoading(false);
        return { success: true, user: userData };
      } 
      else if (email === 'lecturer@example.com' && password === 'password') {
        const userData = {
          id: '2',
          name: 'Jane Lecturer',
          email: 'lecturer@example.com',
          role: 'lecturer',
          department: 'Computer Science'
        };
        const token = 'demo-lecturer-token';
        
        setUser(userData);
        setToken(token);
        setLoading(false);
        return { success: true, user: userData };
      }
      else if (email === 'admin@example.com' && password === 'password') {
        const userData = {
          id: '3',
          name: 'Admin User',
          email: 'admin@example.com',
          role: 'admin',
          department: 'IT Services'
        };
        const token = 'demo-admin-token';
        
        setUser(userData);
        setToken(token);
        setLoading(false);
        return { success: true, user: userData };
      }
      else {
        throw new Error('Invalid email or password');
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return { success: false, error: err.message };
    }
  }, [setUser, setToken]);
  
  // Logout function
  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    navigate('/login');
  }, [setUser, setToken, navigate]);
  
  // Register function (for demonstration purposes)
  const register = useCallback(async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      // In a real app, this would be an API call
      // For demo purposes, we'll just simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate validation
      if (!userData.email || !userData.password || !userData.name) {
        throw new Error('All fields are required');
      }
      
      if (userData.password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }
      
      // Simulate successful registration
      setLoading(false);
      return { success: true };
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return { success: false, error: err.message };
    }
  }, []);
  
  // Check authentication status on initial load
  useEffect(() => {
    const checkAuth = async () => {
      const token = getToken();
      
      if (token && !user) {
        setLoading(true);
        
        try {
          // In a real app, this would verify the token with an API
          // For demo purposes, we'll use a simple check
          if (token === 'demo-student-token') {
            setUser({
              id: '1',
              name: 'John Student',
              email: 'student@example.com',
              role: 'student',
              department: 'Computer Science'
            });
          } else if (token === 'demo-lecturer-token') {
            setUser({
              id: '2',
              name: 'Jane Lecturer',
              email: 'lecturer@example.com',
              role: 'lecturer',
              department: 'Computer Science'
            });
          } else if (token === 'demo-admin-token') {
            setUser({
              id: '3',
              name: 'Admin User',
              email: 'admin@example.com',
              role: 'admin',
              department: 'IT Services'
            });
          } else {
            // Invalid token
            setToken(null);
          }
        } catch (err) {
          setError('Authentication failed');
          setToken(null);
        }
        
        setLoading(false);
      }
    };
    
    checkAuth();
  }, [getToken, setToken, setUser, user]);
  
  // Update user profile
  const updateProfile = useCallback(async (updates) => {
    setLoading(true);
    setError(null);
    
    try {
      // In a real app, this would be an API call
      // For demo purposes, we'll simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update the user state with the new data
      setUser(prevUser => ({
        ...prevUser,
        ...updates
      }));
      
      setLoading(false);
      return { success: true };
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return { success: false, error: err.message };
    }
  }, [setUser]);
  
  // Reset password (for demonstration purposes)
  const resetPassword = useCallback(async (email) => {
    setLoading(true);
    setError(null);
    
    try {
      // In a real app, this would be an API call
      // For demo purposes, we'll simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate validation
      if (!email) {
        throw new Error('Email is required');
      }
      
      // Simulate successful password reset request
      setLoading(false);
      return { success: true, message: 'Password reset email sent' };
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return { success: false, error: err.message };
    }
  }, []);
  
  return {
    user,
    login,
    logout,
    register,
    updateProfile,
    resetPassword,
    isAuthenticated,
    loading,
    error,
    setError,
    getToken
  };
};

export default useAuth;