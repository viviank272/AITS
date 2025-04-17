import axios from 'axios';

const API_URL = 'http://localhost:8000/api'; // Update this with your Django backend URL
// const API_BASE_URL = "https://amnamara.pythonanywhere.com/api";

// Create axios instance with default config
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Temporarily disabled for CORS testing
  withCredentials: false,
  timeout: 30000, // 30 second timeout
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access');
  console.log('Current token:', token);
  console.log('Request URL:', config.url);
  console.log('Request method:', config.method);
  console.log('Request headers:', config.headers);
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('Authorization header added:', config.headers.Authorization);
  } else {
    console.log('No token found in localStorage');
  }
  return config;
});

// Add response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', {
      status: error.response?.status,
      data: error.response?.data,
      headers: error.response?.headers,
      config: error.config
    });
    
    if (error.response?.status === 401) {
      console.log('Unauthorized error detected, clearing auth data...');
      // Clear auth data
      localStorage.removeItem('access');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      localStorage.removeItem('selectedRole');
      
      return Promise.reject(new Error('Unauthorized'));
    }
    return Promise.reject(error);
  }
);

// Add a function to clear all auth data
export const clearAuthData = () => {
  localStorage.removeItem('access');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  localStorage.removeItem('selectedRole');
  delete api.defaults.headers.common['Authorization'];
};

export const logout = async () => {
  try {
    const refresh_token = localStorage.getItem('refreshToken');
    const access_token = localStorage.getItem('access');
    
    if (refresh_token && access_token) {
      // Create a temporary axios instance for logout
      const logoutApi = axios.create({
        baseURL: API_URL,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${access_token}`
        }
      });
      
      // First clear local data
      clearAuthData();
      
      // Then try to logout on the server
      await logoutApi.post('/users/logout/', { refresh_token });
    } else {
      // If no tokens exist, just clear local data
      clearAuthData();
    }
  } catch (error) {
    console.error('Logout error:', error);
    // Even if the server logout fails, we've already cleared local data
  }
};

export const login = async (data) => {
  console.log('Attempting login with:', data);
  try {
    // Clear any existing auth data before login
    clearAuthData();
    
    // Log current token state before login
    console.log('Current token state before login:', {
      access: localStorage.getItem('access'),
      refresh: localStorage.getItem('refreshToken'),
      user: localStorage.getItem('user'),
      role: localStorage.getItem('selectedRole')
    });

    // Log the request data
    console.log('Sending login request with data:', JSON.stringify(data));

    const response = await axios.post(`${API_URL}/users/login/`, data, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    // Log the response
    console.log('Login successful. Response:', response.data);

    // Parse user data if it's a string
    let userData = response.data.user;
    if (typeof userData === 'string') {
      try {
        userData = JSON.parse(userData);
      } catch (e) {
        console.error('Error parsing user data:', e);
        throw new Error('Invalid user data format received from server');
      }
    }

    // Ensure userData is an object
    if (typeof userData !== 'object' || userData === null) {
      throw new Error('Invalid user data format received from server');
    }

    // Store tokens and user data
    localStorage.setItem('access', response.data.access);
    localStorage.setItem('refreshToken', response.data.refresh);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('selectedRole', userData.role);

    // Update axios default headers
    axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;

    // Log the new token state after login
    console.log('New token state after login:', {
      access: localStorage.getItem('access'),
      refresh: localStorage.getItem('refreshToken'),
      user: userData, // Log the parsed object instead of the string
      role: localStorage.getItem('selectedRole')
    });

    return {
      access: response.data.access,
      refresh: response.data.refresh,
      user: userData
    };
  } catch (error) {
    console.error('Login error:', error);
    clearAuthData();
    
    // Enhance error message for better debugging
    if (error.response) {
      if (error.response.status === 401) {
        throw new Error('Invalid credentials');
      } else if (error.response.status === 400) {
        if (error.response.data?.needs_password) {
          throw new Error('Password not set. Please set your password first.');
        }
        throw new Error(error.response.data?.error || 'Invalid request');
      }
    }
    throw error;
  }
};

export const register = async (userData) => {
  const response = await api.post('/users/register/', userData);
  return response.data;
};

export const getProfile = async () => {
  const response = await api.get('/users/profile/');
  return response.data;
};

export const updateProfile = async (profileData) => {
  const response = await api.put('/users/profile/', profileData);
  return response.data;
};

// User services
export const getStudents = async () => {
  const response = await api.get('/users/students/');
  return response.data;
};

export const getUserProfile = async () => {
  const response = await api.get('/users/profile/');
  return response.data;
};

export const createStudent = async (studentData) => {
  console.log('createStudent API call with data:', studentData);
  try {
    const response = await api.post('/users/students/', studentData);
    console.log('createStudent API response:', response);
    return response.data;
  } catch (error) {
    console.error('createStudent API error:', error);
    console.error('Error response:', error.response?.data);
    throw error;
  }
};

export const updateStudent = async (studentId, studentData) => {
  const response = await api.put(`/users/students/${studentId}/`, studentData);
  return response.data;
};

export const deleteStudent = async (studentId) => {
  const response = await api.delete(`/users/students/${studentId}/`);
  return response.data;
};

// Issue services
export const getAllIssues = async () => {
  const response = await api.get('/issues/');
  return response.data;
};

export const getStudentIssues = async () => {
  const response = await api.get('/issues/student/');
  return response.data;
};

export const getLecturerIssues = async () => {
  const response = await api.get('/issues/lecturer/');
  return response.data;
};

export const getIssueById = async (id) => {
  const response = await api.get(`/issues/${id}/`);
  return response.data;
};

export const createIssue = async (issueData) => {
  console.log('Creating issue with data:', issueData);
  const response = await api.post('/issues/create/', issueData);
  console.log('Issue creation response:', response);
  return response.data;
};

export const updateIssue = async (id, issueData) => {
  try {
    console.log('Updating issue with data:', {
      id,
      formData: Object.fromEntries(issueData.entries())
    });
    
    const response = await api.patch(`/issues/${id}/update/`, issueData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    console.log('Update issue response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error in updateIssue:', error);
    console.error('Error response:', error.response?.data);
    throw error;
  }
};

export const deleteIssue = async (id) => {
  const response = await api.delete(`/issues/${id}/`);
  return response.data;
};

// File upload services
export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  console.log('Uploading file:', file.name);
  const response = await api.post('/issues/upload/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  console.log('File upload response:', response);
  return response.data;
};

export const deleteFile = async (fileId) => {
  const response = await api.delete(`/files/${fileId}/`);
  return response.data;
};

// Academic services
export const getColleges = async () => {
  const response = await api.get('/academic/colleges/');
  return response.data;
};

export const getDepartments = async () => {
  const response = await api.get('/academic/departments/');
  return response.data;
};

export const getPrograms = async () => {
  const response = await api.get('/academic/programs/');
  return response.data;
};

export const createCollege = async (collegeData) => {
  const response = await api.post('/academic/colleges/', collegeData);
  return response.data;
};

export const updateCollege = async (id, collegeData) => {
  const response = await api.put(`/academic/colleges/${id}/`, collegeData);
  return response.data;
};

export const deleteCollege = async (id) => {
  const response = await api.delete(`/academic/colleges/${id}/`);
  return response.data;
};

export const createDepartment = async (departmentData) => {
  const response = await api.post('/academic/departments/', departmentData);
  return response.data;
};

export const updateDepartment = async (id, departmentData) => {
  const response = await api.put(`/academic/departments/${id}/`, departmentData);
  return response.data;
};

export const deleteDepartment = async (id) => {
  const response = await api.delete(`/academic/departments/${id}/`);
  return response.data;
};

export const getDepartmentsByCollege = async (collegeId) => {
  const response = await api.get(`/academic/departments/college/${collegeId}/`);
  return response.data;
};

export const getProgramsByDepartment = async (departmentId) => {
  const response = await api.get(`/academic/programs/department/${departmentId}/`);
  return response.data;
};

// Comment services
export const getIssueComments = async (issueId) => {
  const response = await api.get(`/issues/${issueId}/comments/`);
  return response.data;
};

export const postComment = async (issueId, commentData) => {
  const response = await api.post(`/issues/${issueId}/comments/`, commentData);
  return response.data;
};

export const setStudentPassword = async (data) => {
  try {
    const response = await api.post('/users/set-password/', data);
    return response.data;
  } catch (error) {
    console.error('Set password error:', error);
    throw error;
  }
};

export default api; 