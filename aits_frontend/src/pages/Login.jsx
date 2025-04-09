<<<<<<< HEAD
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
=======
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
>>>>>>> e5e6ab6b971e452f17bc45c45c66a703cb7f1ac6
import { useAuth } from '../context/AuthContext';
import logoWhite from '../assets/logo-white.png';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const Login = () => {
  const navigate = useNavigate();
<<<<<<< HEAD
=======
  const location = useLocation();
>>>>>>> e5e6ab6b971e452f17bc45c45c66a703cb7f1ac6
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
<<<<<<< HEAD
//end of line 10
=======
  const [selectedRole, setSelectedRole] = useState(null);

  useEffect(() => {
    // Get role from localStorage
    const storedRole = localStorage.getItem('selectedRole');
    // Also check URL parameters (for compatibility with both approaches)
    const params = new URLSearchParams(location.search);
    const urlRole = params.get('role');
    
    if (urlRole) {
      setSelectedRole(urlRole);
    } else if (storedRole) {
      setSelectedRole(storedRole);
    }
  }, [location.search]);

  // Define test credentials based on role
  const getCredentials = (role) => {
    switch(role) {
      case 'admin':
        return {
          username: 'amonkats8@gmail.com',
          password: 'AK_94*jmv'
        };
      case 'student':
        return {
          username: 'student@muk.ac.ug',
          password: 'student123'
        };
      default:
        return null;
    }
  };

  // Get credentials for current role
  const credentials = selectedRole ? getCredentials(selectedRole) : null;

>>>>>>> e5e6ab6b971e452f17bc45c45c66a703cb7f1ac6
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await login(formData);
      const userType = response.user_type;
      const selectedRole = localStorage.getItem('selectedRole');

      // Check if the user's role matches the selected role
      if (userType !== selectedRole) {
        setError('You are not authorized to access this role. Please select the correct role.');
        setLoading(false);
        return;
      }

      // Redirect based on user type
      switch (userType) {
        case 'admin':
          navigate('/admin');
          break;
        case 'lecturer':
          navigate('/lecturer');
          break;
        case 'student':
          navigate('/student');
          break;
        default:
          navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Failed to login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

<<<<<<< HEAD
=======
  // Function to autofill credentials
  const fillCredentials = () => {
    if (credentials) {
      setFormData({
        email: credentials.username,
        password: credentials.password
      });
    }
  };

>>>>>>> e5e6ab6b971e452f17bc45c45c66a703cb7f1ac6
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
<<<<<<< HEAD
        </div>

=======
          
          {/* Display role-specific info */}
          {selectedRole && (
            <div className="mt-3">
              <p className="text-sm font-medium text-gray-700">Selected role: <span className="font-bold text-[#1E9833] capitalize">{selectedRole}</span></p>
            </div>
          )}
        </div>

        {/* Test credentials box */}
        {credentials && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-md">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm font-medium text-blue-700">Test Credentials</p>
              <button 
                onClick={fillCredentials}
                className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded"
              >
                Auto-fill
              </button>
            </div>
            <p className="text-xs text-gray-600">Username: <span className="font-mono text-gray-800">{credentials.username}</span></p>
            <p className="text-xs text-gray-600">Password: <span className="font-mono text-gray-800">{credentials.password}</span></p>
          </div>
        )}

>>>>>>> e5e6ab6b971e452f17bc45c45c66a703cb7f1ac6
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#1E9833] focus:border-[#1E9833]"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#1E9833] focus:border-[#1E9833]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#1E9833] hover:bg-[#167a2a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1E9833] disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-xs text-gray-600">
            Don't have an account?{' '}
            <button
              onClick={() => navigate('/register')}
              className="text-[#1E9833] hover:text-[#167a2a] font-medium"
            >
              Register here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;