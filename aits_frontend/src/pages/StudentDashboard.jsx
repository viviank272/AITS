import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getStudentIssues } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { PlusIcon } from '@heroicons/react/24/outline';

const StudentDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [issues, setIssues] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const { logout } = useAuth();
  const [stats, setStats] = useState({
    openIssues: 0,
    inProgressIssues: 0,
    resolvedIssues: 0,
    responseTime: '0 days'
  });
  const [allIssues, setAllIssues] = useState([]);
  const [activeFilter, setActiveFilter] = useState(null);
  const navigate = useNavigate();

  // Calculate average response time in days
  const calculateResponseTime = (issues) => {
    if (!issues || issues.length === 0) return '0 days';
    
    // Filter issues that have a response
    const issuesWithResponse = issues.filter(issue => 
      issue.first_response_time || issue.responses?.length > 0
    );
    
    if (issuesWithResponse.length === 0) return 'No data';
    
    // Calculate time difference between creation and first response
    const totalResponseTime = issuesWithResponse.reduce((total, issue) => {
      // If we have a first_response_time field use that
      if (issue.first_response_time) {
        const createdDate = new Date(issue.created_at);
        const responseDate = new Date(issue.first_response_time);
        return total + (responseDate - createdDate);
      }
      // Otherwise try to find the earliest response
      else if (issue.responses && issue.responses.length > 0) {
        const createdDate = new Date(issue.created_at);
        const earliestResponse = issue.responses.sort((a, b) => 
          new Date(a.created_at) - new Date(b.created_at)
        )[0];
        const responseDate = new Date(earliestResponse.created_at);
        return total + (responseDate - createdDate);
      }
      return total;
    }, 0);
    
    // Convert milliseconds to days (rounded to 1 decimal place)
    const averageDays = (totalResponseTime / issuesWithResponse.length) / (1000 * 60 * 60 * 24);
    return `${averageDays.toFixed(1)} days`;
  };

  // Function to fetch issues
  const fetchIssues = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const response = await getStudentIssues();
      
      if (Array.isArray(response)) {
        // Save all issues
        setAllIssues(response);
        
        // Sort by created_at date descending (newest first)
        const sortedIssues = [...response].sort((a, b) => 
          new Date(b.created_at) - new Date(a.created_at)
        );
        
        // Get only the 5 most recent issues
        const recentIssues = sortedIssues.slice(0, 5);
        setIssues(recentIssues);
        
        // Calculate stats
        const openCount = response.filter(issue => {
          const statusName = issue.status_name || 
            (issue.status && typeof issue.status === 'object' && issue.status.name ? 
              issue.status.name : '');
          return statusName.toLowerCase().includes('open');
        }).length;
        
        const inProgressCount = response.filter(issue => {
          const statusName = issue.status_name || 
            (issue.status && typeof issue.status === 'object' && issue.status.name ? 
              issue.status.name : '');
          return statusName.toLowerCase().includes('in progress');
        }).length;
        
        const resolvedCount = response.filter(issue => {
          const statusName = issue.status_name || 
            (issue.status && typeof issue.status === 'object' && issue.status.name ? 
              issue.status.name : '');
          return statusName.toLowerCase().includes('resolved');
        }).length;
        
        // Calculate real response time
        const responseTime = calculateResponseTime(response);
        
        setStats({
          openIssues: openCount,
          inProgressIssues: inProgressCount,
          resolvedIssues: resolvedCount,
          responseTime: responseTime
        });
      } else {
        console.error('Issues data is not in expected format:', response);
        setErrorMessage('Failed to load issues. Please try again.');
      }
    } catch (error) {
      console.error('Error fetching issues:', error);
      
      if (error.response?.status === 401) {
        console.log('Unauthorized error detected, logging out...');
        await logout();
      } else {
        setErrorMessage(`Failed to load issues: ${error.response?.data?.message || error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, [logout]);

  const handleFilterByStatus = (status) => {
    // If clicking the active filter, clear it
    if (activeFilter === status) {
      setActiveFilter(null);
      
      // Reset to 5 most recent issues
      const sortedIssues = [...allIssues].sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      );
      setIssues(sortedIssues.slice(0, 5));
      return;
    }
    
    setActiveFilter(status);
    
    if (status === 'response') {
      // For response time, navigate to the full issues list
      navigate('/student/issues');
      return;
    }
    
    // Filter the issues
    const filteredIssues = allIssues.filter(issue => {
      const statusName = issue.status_name || 
        (issue.status && typeof issue.status === 'object' && issue.status.name ? 
          issue.status.name : '');
      
      if (status === 'open') {
        return statusName.toLowerCase().includes('open');
      } else if (status === 'in_progress') {
        return statusName.toLowerCase().includes('in progress');
      } else if (status === 'resolved') {
        return statusName.toLowerCase().includes('resolved');
      }
      return true;
    });
    
    // Sort by created_at date
    const sortedFilteredIssues = [...filteredIssues].sort((a, b) => 
      new Date(b.created_at) - new Date(a.created_at)
    );
    
    setIssues(sortedFilteredIssues.slice(0, 5));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">Student Dashboard</h1>
            <Link
              to="/student/issues/create"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Create New Issue
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="text-sm font-medium text-gray-500 truncate">OPEN ISSUES</div>
                <div className="mt-3 flex items-baseline">
                  <div className="text-2xl font-semibold text-gray-900">{stats.openIssues}</div>
                  <div className="ml-2">
                    <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                      Active
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="text-sm font-medium text-gray-500 truncate">IN PROGRESS</div>
                <div className="mt-3 flex items-baseline">
                  <div className="text-2xl font-semibold text-gray-900">{stats.inProgressIssues}</div>
                  <div className="ml-2">
                    <span className="text-xs font-medium text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">
                      Being worked on
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="text-sm font-medium text-gray-500 truncate">RESOLVED</div>
                <div className="mt-3 flex items-baseline">
                  <div className="text-2xl font-semibold text-gray-900">{stats.resolvedIssues}</div>
                  <div className="ml-2">
                    <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                      Completed
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="text-sm font-medium text-gray-500 truncate">RESPONSE TIME</div>
                <div className="mt-3 flex items-baseline">
                  <div className="text-2xl font-semibold text-gray-900">{stats.responseTime}</div>
                  <div className="ml-2">
                    <span className="text-xs font-medium text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full">
                      Average
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Issues List */}
          <div className="mt-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {activeFilter ? 
                  activeFilter === 'open' ? 'Open Issues' : 
                  activeFilter === 'in_progress' ? 'In Progress Issues' : 
                  activeFilter === 'resolved' ? 'Resolved Issues' : 
                  'Recent Issues' : 
                  'Recent Issues'
                }
              </h2>
              <div className="flex items-center space-x-4">
                {activeFilter && (
                  <button 
                    onClick={() => handleFilterByStatus(activeFilter)} 
                    className="text-sm font-medium text-red-600 hover:text-red-500"
                  >
                    Clear Filter
                  </button>
                )}
                <Link
                  to="/student/issues"
                  className="text-sm font-medium text-blue-600 hover:text-blue-500"
                >
                  View All Issues
                </Link>
              </div>
            </div>

            {errorMessage && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{errorMessage}</p>
              </div>
            )}

            {/* Issues Table */}
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Issue ID
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Priority
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date & Time Created
                      </th>
                      <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {issues.length > 0 ? (
                      issues.map((issue) => (
                        <tr key={issue.issue_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            #{issue.issue_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {issue.title}
                      </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {issue.category_name || 
                                (issue.category && typeof issue.category === 'object' && issue.category.name ? 
                                  issue.category.name : 
                                  (typeof issue.category === 'number' ? `Category ID: ${issue.category}` : 'N/A'))}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                            {(() => {
                              const statusName = issue.status_name || 
                                (issue.status && typeof issue.status === 'object' && issue.status.name ? 
                                  issue.status.name : 
                                  (typeof issue.status === 'number' ? `Status ID: ${issue.status}` : 'N/A'));
                              
                              let bgColor = 'bg-gray-100';
                              let textColor = 'text-gray-800';
                              
                              if (statusName.toLowerCase().includes('open')) {
                                bgColor = 'bg-green-100';
                                textColor = 'text-green-800';
                              } else if (statusName.toLowerCase().includes('in progress')) {
                                bgColor = 'bg-blue-100';
                                textColor = 'text-blue-800';
                              } else if (statusName.toLowerCase().includes('resolved')) {
                                bgColor = 'bg-cyan-100';
                                textColor = 'text-cyan-800';
                              } else if (statusName.toLowerCase().includes('closed')) {
                                bgColor = 'bg-gray-100';
                                textColor = 'text-gray-800';
                              } else if (statusName.toLowerCase().includes('pending')) {
                                bgColor = 'bg-orange-100';
                                textColor = 'text-orange-800';
                              }
                              
                              return (
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
                                  {statusName}
                        </span>
                              );
                            })()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                            {(() => {
                              const priorityName = issue.priority_name || 
                                (issue.priority && typeof issue.priority === 'object' && issue.priority.name ? 
                                  issue.priority.name : 
                                  (typeof issue.priority === 'number' ? `Priority ID: ${issue.priority}` : 'N/A'));
                              
                              let bgColor = 'bg-gray-100';
                              let textColor = 'text-gray-800';
                              
                              if (priorityName.toLowerCase().includes('critical')) {
                                bgColor = 'bg-red-100';
                                textColor = 'text-red-800';
                              } else if (priorityName.toLowerCase().includes('high')) {
                                bgColor = 'bg-orange-100';
                                textColor = 'text-orange-800';
                              } else if (priorityName.toLowerCase().includes('medium')) {
                                bgColor = 'bg-yellow-100';
                                textColor = 'text-yellow-800';
                              } else if (priorityName.toLowerCase().includes('low')) {
                                bgColor = 'bg-green-100';
                                textColor = 'text-green-800';
                              }
                              
                              return (
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
                                  {priorityName}
                        </span>
                              );
                            })()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(issue.created_at).toLocaleString()}
                      </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                            <Link 
                              to={`/student/issues/${issue.issue_id}`} 
                              className="inline-flex items-center justify-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                              View
                            </Link>
                      </td>
                    </tr>
                      ))
                    ) : (
                    <tr>
                        <td colSpan="7" className="px-6 py-10 text-center text-gray-500">
                        No issues found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard; 