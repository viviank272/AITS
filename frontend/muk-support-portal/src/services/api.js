import axios from 'axios';

const API_URL = 'http://localhost:8000/api'; // Update this with your Django backend URL
// const API_BASE_URL = "https://amnamara.pythonanywhere.com/api";

// Create axios instance with default config
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable CORS credentials
  timeout: 30000, // 30 second timeout
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access');
  console.log('Request interceptor:', {
    url: config.url,
    method: config.method,
    token: token ? 'present' : 'none',
    currentHeaders: config.headers
  });
  
  if (token) {
    // Ensure headers object exists
    config.headers = config.headers || {};
    // Set Authorization header
    config.headers.Authorization = `Bearer ${token}`;
    console.log('Added Authorization header:', `Bearer ${token}`);
  } else {
    console.log('No token available for request');
    // Remove Authorization header if it exists
    if (config.headers?.Authorization) {
      delete config.headers.Authorization;
    }
  }
  return config;
}, (error) => {
  console.error('Request interceptor error:', error);
  return Promise.reject(error);
});

// Add response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.log('Response interceptor error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      isLoginRequest: error.config?.url.includes('/users/login/'),
      headers: error.config?.headers,
      method: error.config?.method
    });
    
    if (error.response?.status === 401) {
      // Skip auth handling for login/logout endpoints
      const isAuthEndpoint = error.config?.url.includes('/users/login/') || 
                           error.config?.url.includes('/users/logout/');
      
      if (!isAuthEndpoint) {
        console.log('Unauthorized error on protected endpoint, clearing auth data...');
        // Clear auth data
        clearAuthData();
        
        // Only redirect if we're not already on the login page
        if (!window.location.pathname.includes('/login')) {
          console.log('Redirecting to login page...');
          window.location.href = '/login';
          return Promise.reject(new Error('Session expired - Please log in again'));
        }
      } else {
        console.log('Unauthorized error on auth endpoint, passing through...');
      }
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

    const response = await api.post('/users/login/', data);
    
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

    // Update api instance headers
    api.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;
    
    // Verify token is set
    console.log('Verifying auth setup after login:', {
      storedToken: localStorage.getItem('access'),
      headerToken: api.defaults.headers.common['Authorization'],
      role: userData.role
    });

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
  try {
    // Check if there's a token before making the request
    const token = localStorage.getItem('access');
    if (!token) {
      console.error('No access token available for profile request');
      throw new Error('Authentication required');
    }

    const response = await api.get('/users/profile/');
    return response.data;
  } catch (error) {
    console.error('API Error:', error.response || error);
    
    // Handle specific error cases
    if (error.response?.status === 500) {
      console.error('Server error when fetching profile. Backend issue detected.');
      // You might want to log this to a monitoring service
    } else if (error.response?.status === 401) {
      console.error('Authentication error when fetching profile');
      // Consider clearing auth data and redirecting to login
      // clearAuthData();
    }
    
    throw error;
  }
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

export const getLecturersAndAdmins = async () => {
  const response = await api.get('/users/lecturers-and-admins/');
  return response.data;
};

export const getAllUsers = async () => {
  const response = await api.get('/users/all/');
  return response.data;
};

// Issue services
export const getAllIssues = async () => {
  const response = await api.get('/issues/');
  return response.data;
};

export const getStatuses = async () => {
  const response = await api.get('/issues/statuses/');
  return response.data;
};

export const getStudentIssues = async () => {
  const response = await api.get('/issues/student/');
  return response.data;
};

export const getLecturerIssues = async (params = {}) => {
  const response = await api.get('/issues/lecturer/', { params });
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
    // Ensure we have a valid ID
    if (!id) {
      throw new Error('Issue ID is required');
    }
    
    // Use the correct endpoint
    const endpoint = `/issues/${id}/update/`;
    console.log(`Making updateIssue request to endpoint: ${endpoint}`, issueData);
    
    // Handle FormData vs JSON data differently
    if (issueData instanceof FormData) {
      // For FormData objects (like file uploads)
      let formDataEntries = {};
      
      // Log FormData contents for debugging
      for (let [key, value] of issueData.entries()) {
        formDataEntries[key] = value;
      }
      
      console.log('Updating issue with FormData:', {
        id,
        formData: formDataEntries
      });
      
      const response = await api.patch(endpoint, issueData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('Update issue response:', response);
      return response;
      
    } else {
      // For regular JSON data
      const payload = {...issueData};
      
      // Special handling for status field
      if (Object.prototype.hasOwnProperty.call(payload, 'status')) {
        console.log('Status update detected. Original value:', payload.status);
      }
      
      console.log('Updating issue with JSON data:', {
        id,
        payload
      });
      
      // Send the request with the proper content type
      const response = await api.patch(endpoint, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Update issue response:', response);
      
      if (!response || !response.data) {
        throw new Error('No response data received from server');
      }

      // If the update was successful and the user is a lecturer, create a notification
      if (response.data && localStorage.getItem('selectedRole') === 'lecturer') {
        // Get the current user's name
        const user = JSON.parse(localStorage.getItem('user'));
        const lecturerName = user?.full_name || 'A lecturer';
        
        // Create notification data
        const notificationData = {
          issue: id,
          user: response.data.reporter_id, // The student who created the issue
          type: 'Issue Update',
          message: `${lecturerName} has updated your issue #${id}`,
          is_read: false
        };
        
        // Send notification using the notifications endpoint
        await api.post('/notifications/create/', notificationData);
      }
      
      return response;
    }
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
export const getColleges = async (includeDisabled = false) => {
  const response = await api.get(`/academic/colleges/${includeDisabled ? '?include_disabled=true' : ''}`);
  return response.data;
};

export const getDepartments = async (includeDisabled = false) => {
  const response = await api.get(`/academic/departments/${includeDisabled ? '?include_disabled=true' : ''}`);
  return response.data;
};

export const getPrograms = async () => {
  const response = await api.get('/academic/programs/');
  return response.data;
};

export const createProgram = async (programData) => {
  try {
    console.log('Creating program with data:', JSON.stringify(programData, null, 2));
    const response = await api.post('/academic/programs/', programData);
    console.log('Program creation successful:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating program:', error);
    if (error.response) {
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
      
      // Log validation errors if they exist
      if (error.response.data && typeof error.response.data === 'object') {
        for (const [key, value] of Object.entries(error.response.data)) {
          console.error(`Field "${key}" error:`, value);
        }
      }
    }
    throw error;
  }
};

export const updateProgram = async (id, programData) => {
  try {
    console.log(`Updating program ${id} with data:`, JSON.stringify(programData, null, 2));
    const response = await api.put(`/academic/programs/${id}/`, programData);
    console.log('Program update successful:', response.data);
    return response.data;
  } catch (error) {
    console.error(`Error updating program ${id}:`, error);
    if (error.response) {
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
      
      // Log validation errors if they exist
      if (error.response.data && typeof error.response.data === 'object') {
        for (const [key, value] of Object.entries(error.response.data)) {
          console.error(`Field "${key}" error:`, value);
        }
      }
    }
    throw error;
  }
};

export const deleteProgram = async (id) => {
  const response = await api.delete(`/academic/programs/${id}/`);
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
  try {
    const response = await api.put(`/academic/departments/${id}/`, departmentData);
    return response.data;
  } catch (error) {
    console.error('API Error:', error.response || error);
    throw error;
  }
};

export const deleteDepartment = async (id) => {
  const response = await api.delete(`/academic/departments/${id}/`);
  return response.data;
};

export const getDepartmentsByCollege = async (collegeId, includeDisabled = false) => {
  const response = await api.get(`/academic/departments/college/${collegeId}/${includeDisabled ? '?include_disabled=true' : ''}`);
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

// Reports API services
export const getIssueReports = async (dateRange = 'week') => {
  try {
    // Get all issues with date range filter
    const issues = await getAllIssues();
    
    // Filter issues based on date range
    const filteredIssues = filterByDateRange(issues, dateRange, 'created_at');
    
    // Calculate statistics
    const total = filteredIssues.length;
    const resolved = filteredIssues.filter(issue => issue.status?.name?.toLowerCase() === 'resolved').length;
    const pending = total - resolved;
    
    // Calculate average resolution time
    let totalResolutionTime = 0;
    let resolvedIssuesCount = 0;
    
    filteredIssues.forEach(issue => {
      if (issue.resolved_at && issue.created_at) {
        const createdDate = new Date(issue.created_at);
        const resolvedDate = new Date(issue.resolved_at);
        const resolutionTime = (resolvedDate - createdDate) / (1000 * 60 * 60 * 24); // in days
        totalResolutionTime += resolutionTime;
        resolvedIssuesCount++;
      }
    });
    
    const averageResolutionTime = resolvedIssuesCount > 0
      ? (totalResolutionTime / resolvedIssuesCount).toFixed(1)
      : 0;
    
    // Process trends data (number of issues per day)
    const trendMap = {};
    filteredIssues.forEach(issue => {
      const date = new Date(issue.created_at).toISOString().split('T')[0];
      trendMap[date] = (trendMap[date] || 0) + 1;
    });
    
    const sortedDates = Object.keys(trendMap).sort();
    const trends = sortedDates.map(date => ({ date, count: trendMap[date] }));
    
    // Process category distribution
    const categoryMap = {};
    filteredIssues.forEach(issue => {
      const category = issue.category?.name || 'Uncategorized';
      categoryMap[category] = (categoryMap[category] || 0) + 1;
    });
    
    const byCategory = Object.entries(categoryMap).map(([category, count]) => ({
      category,
      count,
      percentage: Math.round((count / total) * 100) || 0
    }));
    
    // Process status distribution
    const statusMap = {};
    filteredIssues.forEach(issue => {
      const status = issue.status?.name || 'Unknown';
      statusMap[status] = (statusMap[status] || 0) + 1;
    });
    
    const byStatus = Object.entries(statusMap).map(([status, count]) => ({
      status,
      count,
      percentage: Math.round((count / total) * 100) || 0
    }));
    
    return {
      total,
      resolved,
      pending,
      averageResolutionTime,
      trends,
      byCategory,
      byStatus,
      rawData: filteredIssues // Include raw data for custom processing
    };
  } catch (error) {
    console.error('Error fetching issue reports:', error);
    throw error;
  }
};

export const getUserReports = async (dateRange = 'week') => {
  try {
    // Get all users
    const users = await getAllUsers();
    
    // Calculate statistics
    const total = users.length;
    const active = users.filter(user => user.is_active).length;
    
    // Filter users based on date range for "new users"
    const newUsers = filterByDateRange(users, dateRange, 'date_joined').length;
    
    // Process role distribution
    const roleMap = {};
    users.forEach(user => {
      let role;
      if (user.user_type === 'student') role = 'Students';
      else if (user.college) role = 'Colleges';
      else if (user.user_type === 'staff' || user.is_staff) role = 'Staff';
      else role = 'Other';
      
      roleMap[role] = (roleMap[role] || 0) + 1;
    });
    
    const byRole = Object.entries(roleMap).map(([role, count]) => ({
      role,
      count,
      percentage: Math.round((count / total) * 100) || 0
    }));
    
    // Generate user activity data based on creation dates
    // This is a proxy for real login activity which would require additional tracking
    const activityMap = {};
    const now = new Date();
    const pastDate = new Date();
    
    // Set date based on range
    switch (dateRange) {
      case 'month': pastDate.setDate(now.getDate() - 30); break;
      case 'quarter': pastDate.setDate(now.getDate() - 90); break;
      case 'year': pastDate.setDate(now.getDate() - 365); break;
      case 'week':
      default: pastDate.setDate(now.getDate() - 7);
    }
    
    // Create array of dates for the selected period
    const dates = [];
    const currentDate = new Date(pastDate);
    while (currentDate <= now) {
      dates.push(currentDate.toISOString().split('T')[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Count users that existed on each date
    dates.forEach(date => {
      const activeUsersCount = users.filter(user => 
        new Date(user.date_joined) <= new Date(date) && user.is_active
      ).length;
      activityMap[date] = activeUsersCount;
    });
    
    const activity = Object.entries(activityMap).map(([date, active]) => ({ date, active }));
    
    return {
      total,
      active,
      new: newUsers,
      byRole,
      activity,
      rawData: users // Include raw data for custom processing
    };
  } catch (error) {
    console.error('Error fetching user reports:', error);
    throw error;
  }
};

// Helper function to filter data by date range
const filterByDateRange = (data, dateRange, dateField) => {
  const now = new Date();
  let startDate;
  
  switch (dateRange) {
    case 'month':
      startDate = new Date();
      startDate.setMonth(now.getMonth() - 1);
      break;
    case 'quarter':
      startDate = new Date();
      startDate.setMonth(now.getMonth() - 3);
      break;
    case 'year':
      startDate = new Date();
      startDate.setFullYear(now.getFullYear() - 1);
      break;
    case 'week':
    default:
      startDate = new Date();
      startDate.setDate(now.getDate() - 7);
  }
  
  return data.filter(item => {
    if (!item[dateField]) return false;
    const itemDate = new Date(item[dateField]);
    return itemDate >= startDate && itemDate <= now;
  });
};

export const getOverviewReports = async (dateRange = 'week') => {
  try {
    const [issueData, userData] = await Promise.all([
      getIssueReports(dateRange),
      getUserReports(dateRange)
    ]);
    
    return { issueData, userData };
  } catch (error) {
    console.error('Error fetching overview reports:', error);
    throw error;
  }
};

// Category services
export const getCategories = async () => {
  const response = await api.get('/issues/categories/');
  return response.data;
};

export const createCategory = async (categoryData) => {
  // Ensure college is always null to make the category global
  const data = { ...categoryData, college: null };
  const response = await api.post('/issues/categories/create/', data);
  return response.data;
};

export const updateCategory = async (id, categoryData) => {
  // Ensure college is always null to make the category global
  const data = { ...categoryData, college: null };
  const response = await api.put(`/issues/categories/${id}/update/`, data);
  return response.data;
};

export const deleteCategory = async (id) => {
  const response = await api.delete(`/issues/categories/${id}/delete/`);
  return response.data;
};

// Role services 
export const getRoles = async () => {
  const response = await api.get('/users/roles/');
  return response.data;
};

export const getRoleById = async (id) => {
  const response = await api.get(`/users/roles/${id}/`);
  return response.data;
};

export const createRole = async (roleData) => {
  const response = await api.post('/users/roles/create/', roleData);
  return response.data;
};

export const updateRole = async (id, roleData) => {
  const response = await api.put(`/users/roles/${id}/`, roleData);
  return response.data;
};

export const deleteRole = async (id) => {
  const response = await api.delete(`/users/roles/${id}/`);
  return response.data;
};

// Notification services
export const getStudentNotifications = async () => {
  try {
    const response = await api.get('/notifications/student/', {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching student notifications:', error);
    if (error.response?.status === 401) {
      // Handle unauthorized error
      clearAuthData();
      window.location.href = '/login';
    }
    throw error;
  }
};

export const markNotificationAsRead = async (notificationId) => {
  try {
    const response = await api.put(`/notifications/${notificationId}/read/`, {}, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

export const markAllNotificationsAsRead = async () => {
  try {
    const response = await api.put('/notifications/mark-all-read/', {}, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

export const createNotification = async (notificationData) => {
  try {
    const response = await api.post('/notifications/create/', notificationData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

export default api; 