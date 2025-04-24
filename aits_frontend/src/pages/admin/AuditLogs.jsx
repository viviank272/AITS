import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSearch,
  faDownload,
  faUser,
  faClock,
  faInfoCircle,
  faExclamationTriangle,
  faCheckCircle,
  faTimesCircle,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';
import '../../utils/fontawesome';
import axios from 'axios';
import { API_BASE_URL } from '../../config';
import { toast } from 'react-toastify';

const AuditLogs = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterUser, setFilterUser] = useState('all');
  const [dateRange, setDateRange] = useState('week');
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [users, setUsers] = useState([]);
  const [isExporting, setIsExporting] = useState(false);

  // Check authentication on component mount
  useEffect(() => {
    const token = localStorage.getItem('access');
    if (!token) {
      setError('You must be logged in to view audit logs');
      // You could also redirect to login page here
    }
  }, []);

  // Helper function to make authenticated requests
  const makeAuthenticatedRequest = async (url, options = {}) => {
    const token = localStorage.getItem('access');
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const defaultOptions = {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };
    
    return axios({
      url: `${API_BASE_URL}${url}`,
      ...defaultOptions,
      ...options
    });
  };

  useEffect(() => {
    // Create a debounce function for search term
    const handler = setTimeout(() => {
      fetchAuditLogs();
    }, 300);

    // Clear timeout if searchTerm changes again within 300ms
    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  useEffect(() => {
    // Fetch audit logs when component mounts or filters change
    fetchAuditLogs();
    // Fetch users for filter dropdown
    fetchUsers();
  }, [page, filterType, filterUser, dateRange]);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Build query parameters
      const params = {
        page,
        search: searchTerm,
        type: filterType,
        user: filterUser,
        date_range: dateRange
      };
      
      // Remove any undefined or 'all' params
      Object.keys(params).forEach(key => {
        if (params[key] === undefined || (key !== 'page' && key !== 'search' && params[key] === 'all')) {
          delete params[key];
        }
      });
      
      const response = await makeAuthenticatedRequest('/api/audit-logs/', {
        params
      });
      
      // Check if the response data has a results property or is an array directly
      const responseData = response.data;
      if (Array.isArray(responseData)) {
        setAuditLogs(responseData);
        setTotalCount(responseData.length);
      } else if (responseData && typeof responseData === 'object') {
        setAuditLogs(responseData.results || []);
        setTotalCount(responseData.count || responseData.results?.length || 0);
      } else {
        setAuditLogs([]);
        setTotalCount(0);
      }
    } catch (err) {
      console.error('Error fetching audit logs:', err);
      let errorMessage = 'Failed to load audit logs. Please try again later.';
      
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        if (err.response.status === 403) {
          errorMessage = 'You do not have permission to view audit logs.';
        } else if (err.response.status === 401) {
          errorMessage = 'Your session has expired. Please log in again.';
          // Could also redirect to login page here if needed
        } else if (err.response.data && err.response.data.detail) {
          errorMessage = err.response.data.detail;
        }
      } else if (err.request) {
        // The request was made but no response was received
        errorMessage = 'No response from server. Please check your connection.';
      } else if (err.message === 'No authentication token found') {
        errorMessage = 'You must be logged in to view audit logs.';
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      // Use the all users endpoint which is allowed for admin users
      const response = await makeAuthenticatedRequest('/api/users/all/');
      setUsers(response.data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
      // Don't show toast for this error to avoid multiple notifications
    }
  };

  const handleSearchSubmit = (e) => {
    if (e) {
      e.preventDefault();
    }
    setPage(1); // Reset to first page when searching
    fetchAuditLogs();
  };

  const handleExportLogs = async () => {
    try {
      setIsExporting(true);
      
      // Build query parameters for export (same as current filters)
      const params = {
        search: searchTerm,
        type: filterType,
        user: filterUser,
        date_range: dateRange
      };
      
      // Remove any undefined or 'all' params
      Object.keys(params).forEach(key => {
        if (params[key] === undefined || params[key] === 'all') {
          delete params[key];
        }
      });
      
      const response = await makeAuthenticatedRequest('/api/audit-logs/export/', {
        params,
        responseType: 'blob'
      });
      
      // Create a download link and trigger download
      const contentType = response.headers['content-type'] || 'text/csv';
      const blob = new Blob([response.data], { type: contentType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Get filename from content-disposition header or use default
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'audit_logs.csv';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/"/g, '');
        }
      }
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url); // Clean up
      
      toast.success('Audit logs exported successfully');
    } catch (err) {
      console.error('Error exporting audit logs:', err);
      let errorMessage = 'Failed to export audit logs';
      
      if (err.response) {
        if (err.response.status === 403) {
          errorMessage = 'You do not have permission to export audit logs';
        } else if (err.response.status === 401) {
          errorMessage = 'Your session has expired. Please log in again';
        } else if (err.response.data && err.response.data.detail) {
          errorMessage = err.response.data.detail;
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setIsExporting(false);
    }
  };

  const getStatusColor = (type) => {
    switch (type) {
      case 'info':
        return 'text-blue-600 bg-blue-50';
      case 'success':
        return 'text-green-600 bg-green-50';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50';
      case 'error':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (type) => {
    switch (type) {
      case 'info':
        return faInfoCircle;
      case 'success':
        return faCheckCircle;
      case 'warning':
        return faExclamationTriangle;
      case 'error':
        return faTimesCircle;
      default:
        return faInfoCircle;
    }
  };

  const totalPages = Math.ceil(totalCount / 10); // 10 items per page

  // Add this function to handle pagination changes
  const handlePageChange = (newPage) => {
    setPage(newPage);
    // Scroll back to top when changing pages
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-[#1e1e77]">Audit Logs</h1>
        <button
          onClick={handleExportLogs}
          disabled={isExporting}
          className="flex items-center gap-2 px-4 py-2 bg-[#1e1e77] text-white rounded-lg hover:bg-[#2a2a8f] disabled:opacity-70"
        >
          {isExporting ? (
            <FontAwesomeIcon icon={faSpinner} spin />
          ) : (
            <FontAwesomeIcon icon={faDownload} />
          )}
          {isExporting ? 'Exporting...' : 'Export Logs'}
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <form onSubmit={handleSearchSubmit} className="relative">
          <input
            type="text"
            placeholder="Search logs..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FontAwesomeIcon
            icon={faSearch}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
          <button type="submit" className="hidden">Search</button>
        </form>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="all">All Types</option>
          <option value="info">Info</option>
          <option value="success">Success</option>
          <option value="warning">Warning</option>
          <option value="error">Error</option>
        </select>
        <select
          value={filterUser}
          onChange={(e) => setFilterUser(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="all">All Users</option>
          {users && users.length > 0 ? (
            users.map(user => (
              <option key={user.user_id} value={user.user_id}>
                {user.full_name || user.email || `User ${user.user_id}`}
              </option>
            ))
          ) : (
            <option value="" disabled>Loading users...</option>
          )}
        </select>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="day">Last 24 Hours</option>
          <option value="week">Last Week</option>
          <option value="month">Last Month</option>
          <option value="year">Last Year</option>
        </select>
      </div>

      {/* Loading and Error States */}
      {loading && (
        <div className="flex justify-center items-center my-8">
          <FontAwesomeIcon icon={faSpinner} spin className="text-[#1e1e77] text-2xl mr-2" />
          <span>Loading audit logs...</span>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
          <p>{error}</p>
        </div>
      )}

      {/* Logs Table */}
      {!loading && !error && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    IP Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {auditLogs && auditLogs.length > 0 ? (
                  auditLogs.map(log => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FontAwesomeIcon icon={faClock} className="text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">{new Date(log.timestamp).toLocaleString()}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FontAwesomeIcon icon={faUser} className="text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">{log.username || 'Unknown User'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{log.action || 'Unknown Action'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900">{log.details || 'No details available'}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{log.ip_address || 'Unknown'}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(log.type)}`}>
                          <FontAwesomeIcon icon={getStatusIcon(log.type)} className="mr-1" />
                          {log.type ? (log.type.charAt(0).toUpperCase() + log.type.slice(1)) : 'Unknown'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center">
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <FontAwesomeIcon icon={faInfoCircle} className="text-gray-400 text-4xl" />
                        <p className="text-gray-500 font-medium">No audit logs found</p>
                        <p className="text-gray-400 text-sm">Try changing your search criteria or filters</p>
                        <button 
                          onClick={() => {
                            setSearchTerm('');
                            setFilterType('all');
                            setFilterUser('all');
                            setDateRange('week'); 
                            setPage(1);
                          }}
                          className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                        >
                          Reset all filters
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {!loading && !error && totalPages > 0 && (
        <div className="mt-4 flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Showing {auditLogs.length} of {totalCount} logs
          </div>
          <div className="flex gap-2">
            <button 
              className={`px-3 py-1 border rounded-lg text-sm ${page > 1 ? 'hover:bg-gray-50' : 'opacity-50 cursor-not-allowed'}`}
              onClick={() => handlePageChange(Math.max(1, page - 1))}
              disabled={page <= 1}
            >
              Previous
            </button>
            {[...Array(Math.min(5, totalPages))].map((_, i) => {
              // Calculate page numbers to show, centered around current page
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  className={`px-3 py-1 border rounded-lg text-sm ${
                    pageNum === page ? 'bg-[#1e1e77] text-white' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => handlePageChange(pageNum)}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              className={`px-3 py-1 border rounded-lg text-sm ${page < totalPages ? 'hover:bg-gray-50' : 'opacity-50 cursor-not-allowed'}`}
              onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogs; 