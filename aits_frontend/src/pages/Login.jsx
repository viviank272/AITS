import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import logoWhite from '../assets/logo-white.png';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { setStudentPassword, clearAuthData } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [needsPassword, setNeedsPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    // Get role from localStorage
    const storedRole = localStorage.getItem('selectedRole');
    // Also check URL parameters (for compatibility with both approaches)
    const params = new URLSearchParams(location.search);
    const urlRole = params.get('role');
    
    // Prioritize URL role over stored role
    if (urlRole) {
      setSelectedRole(urlRole);
      localStorage.setItem('selectedRole', urlRole);
    } else if (storedRole) {
      setSelectedRole(storedRole);
    }
  }, [location.search]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSetPassword = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      await setStudentPassword({
        email: formData.email,
        password: newPassword
      });
      
      // After setting password, try to login
      const loginData = {
        email: formData.email.trim(),
        password: newPassword,
        role: selectedRole
      };
      
      await login(loginData);
    } catch (error) {
      console.error('Set password error:', error);
      if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else {
        setError('An error occurred while setting your password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!selectedRole) {
        throw new Error('Please select a role before logging in');
      }

      const loginData = {
        email: formData.email.trim(),
        password: formData.password,
        role: selectedRole
      };
      
      await login(loginData);
      
      // Clear form data only after successful login
      setFormData({
        email: '',
        password: '',
      });
    } catch (error) {
      console.error('Login error:', error);
      if (error.message === 'Password not set. Please set your password first.') {
        setNeedsPassword(true);
      } else {
        setError(error.message || 'An error occurred during login. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Add cleanup effect when component unmounts
  useEffect(() => {
    return () => {
      // Clear form data when component unmounts
      setFormData({
        email: '',
        password: '',
      });
      setError('');
      setLoading(false);
    };
  }, []);

  // Add effect to handle role changes
  useEffect(() => {
    if (selectedRole) {
      // Clear all existing data when role changes
      setFormData({
        email: '',
        password: '',
      });
      setError('');
      setNeedsPassword(false);
      setNewPassword('');
      setConfirmPassword('');
      // Clear any existing auth data
      clearAuthData();
    }
  }, [selectedRole]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1E9833]">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
        <div className="text-center mb-6">
          <button
            onClick={() => navigate('/')}
            className="absolute left-4 top-4 text-white hover:text-gray-200 transition-colors"
          >
            <ArrowLeftIcon className="h-6 w-6" />
          </button>
          <img
            src={logoWhite}
            alt="Makerere University Logo"
            className="h-32 w-auto object-contain mx-auto mb-6"
          />
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Academic Issue Tracker</h2>
          <p className="text-sm text-gray-600">
            Please sign in to your account
          </p>
          
          {selectedRole && (
            <div className="mt-3">
              <p className="text-sm font-medium text-gray-700">Selected role: <span className="font-bold text-[#1E9833] capitalize">{selectedRole}</span></p>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {needsPassword ? (
          <form onSubmit={handleSetPassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">New Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-1 block w-full border rounded-lg px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 block w-full border rounded-lg px-3 py-2"
                required
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={showPassword}
                onChange={() => setShowPassword(!showPassword)}
                className="h-4 w-4 text-[#1E9833] focus:ring-[#1E9833] border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">Show password</label>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1E9833] text-white py-2 px-4 rounded-lg hover:bg-[#17802a] focus:outline-none focus:ring-2 focus:ring-[#1E9833] focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? 'Setting password...' : 'Set Password'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full border rounded-lg px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="mt-1 block w-full border rounded-lg px-3 py-2"
                required
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={showPassword}
                onChange={() => setShowPassword(!showPassword)}
                className="h-4 w-4 text-[#1E9833] focus:ring-[#1E9833] border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">Show password</label>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1E9833] text-white py-2 px-4 rounded-lg hover:bg-[#17802a] focus:outline-none focus:ring-2 focus:ring-[#1E9833] focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        )}

        <div className="mt-4 text-center">
          <p className="text-xs text-gray-600">
            Don't have an account?{' '}
            <button
              onClick={() => navigate('/register')}
              className="text-[#1E9833] hover:text-[#167a2a] font-medium"
            >
              Register
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;