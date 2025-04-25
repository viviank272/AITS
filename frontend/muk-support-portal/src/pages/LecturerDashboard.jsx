import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  DocumentTextIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  EllipsisHorizontalIcon
} from '@heroicons/react/24/outline';
import { api } from '../services/api';

function LecturerDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    assigned: 0,
    responseRate: 0,
    resolvedThisWeek: 0,
    slaBreaches: 0
  });
  const [criticalPriorityIssues, setCriticalPriorityIssues] = useState([]);
  const [activeTab, setActiveTab] = useState('assigned');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [issues, setIssues] = useState({
    assigned: [],
    resolved: []
  });
  const [categoryDistribution, setCategoryDistribution] = useState([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState('7');
  const [assignedIssues, setAssignedIssues] = useState([]);
  const [assignedLoading, setAssignedLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [statuses, setStatuses] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories
        const categoriesResponse = await api.get('/issues/categories/');
        if (categoriesResponse.data && Array.isArray(categoriesResponse.data)) {
          setCategories(categoriesResponse.data);
        }

        // Fetch statuses
        const statusesResponse = await api.get('/issues/statuses/');
        if (statusesResponse.data && Array.isArray(statusesResponse.data)) {
          setStatuses(statusesResponse.data);
        }

        // Fetch critical priority issues
        const criticalResponse = await api.get('/issues/lecturer/', {
          params: {
            priority: 'critical',
            limit: 5,
            ordering: '-created_at'  // Order by creation date, newest first
          }
        });

        // Fetch category distribution
        const categoryResponse = await api.get('/issues/category-distribution/', {
          params: {
            time_range: selectedTimeRange
          }
        });

        // Transform the data to match the frontend format
        const transformedCriticalIssues = criticalResponse.data?.map(issue => ({
          id: issue.issue_id,
          title: issue.title,
          timeLeft: issue.due_date ? calculateTimeLeft(issue.due_date) : '',
          status: issue.status_name,
          daysAgo: calculateDaysAgo(issue.created_at),
          selected: false,
          priority: issue.priority_name,
          category: issue.category_name,
          reporter: issue.reporter_details?.full_name || 'Unknown'
        })) || [];

        console.log('Critical issues:', transformedCriticalIssues); // Debug log
        setCriticalPriorityIssues(transformedCriticalIssues);
        setCategoryDistribution(categoryResponse.data?.results || []);

        // Fetch stats
        const statsResponse = await api.get('/issues/stats/');
        setStats(statsResponse.data || {
          assigned: 0,
          responseRate: 0,
          resolvedThisWeek: 0,
          slaBreaches: 0
        });

        // Fetch assigned issues (last 5)
        console.log('Fetching assigned issues...');
        const assignedResponse = await api.get('/issues/lecturer/', {
          params: { 
            assigned: true,
            limit: 5,
            ordering: '-created_at' // Order by creation date, newest first
          }
        });

        console.log('Raw assigned issues response:', assignedResponse);
        console.log('Response status:', assignedResponse.status);
        console.log('Response headers:', assignedResponse.headers);
        console.log('Response data:', assignedResponse.data);
        console.log('Response data type:', typeof assignedResponse.data);
        console.log('Response data keys:', Object.keys(assignedResponse.data || {}));
        console.log('Response results:', assignedResponse.data?.results);
        console.log('Response results type:', typeof assignedResponse.data?.results);
        console.log('Response results length:', assignedResponse.data?.results?.length);

        // Transform assigned issues to match the table format
        let transformedAssignedIssues = [];
        if (Array.isArray(assignedResponse.data?.results)) {
          transformedAssignedIssues = assignedResponse.data.results.map(issue => {
            console.log('Processing issue:', issue);
            return {
              issue_id: issue.issue_id,
              title: issue.title,
              reporter_details: issue.reporter_details,
              category_name: issue.category_name,
              priority_name: issue.priority_name,
              status_name: issue.status_name,
              created_at: issue.created_at,
              due_date: issue.due_date
            };
          });
        } else if (Array.isArray(assignedResponse.data)) {
          transformedAssignedIssues = assignedResponse.data.map(issue => {
            console.log('Processing issue (direct array):', issue);
            return {
              issue_id: issue.issue_id,
              title: issue.title,
              reporter_details: issue.reporter_details,
              category_name: issue.category_name,
              priority_name: issue.priority_name,
              status_name: issue.status_name,
              created_at: issue.created_at,
              due_date: issue.due_date
            };
          });
        }

        console.log('Final transformed assigned issues:', transformedAssignedIssues);
        console.log('Transformed issues length:', transformedAssignedIssues.length);
        setAssignedIssues(transformedAssignedIssues);

        // Fetch resolved issues
        console.log('Fetching resolved issues...');
        const resolvedResponse = await api.get('/issues/lecturer/', {
          params: { 
            resolved: true,
            limit: 5,
            ordering: '-resolved_at' // Order by resolution date, newest first
          }
        });

        console.log('Raw resolved issues response:', resolvedResponse);
        console.log('Response status:', resolvedResponse.status);
        console.log('Response headers:', resolvedResponse.headers);
        console.log('Response data:', resolvedResponse.data);
        console.log('Response data type:', typeof resolvedResponse.data);
        console.log('Response data keys:', Object.keys(resolvedResponse.data || {}));
        console.log('Response results:', resolvedResponse.data?.results);
        console.log('Response results type:', typeof resolvedResponse.data?.results);
        console.log('Response results length:', resolvedResponse.data?.results?.length);

        // Transform resolved issues to match the table format
        let transformedResolvedIssues = [];
        if (Array.isArray(resolvedResponse.data?.results)) {
          transformedResolvedIssues = resolvedResponse.data.results.map(issue => {
            console.log('Processing resolved issue:', issue);
            return {
              issue_id: issue.issue_id,
              title: issue.title,
              reporter_details: issue.reporter_details,
              category_name: issue.category_name,
              priority_name: issue.priority_name,
              status_name: issue.status_name,
              created_at: issue.created_at,
              resolved_at: issue.resolved_at
            };
          });
        } else if (Array.isArray(resolvedResponse.data)) {
          transformedResolvedIssues = resolvedResponse.data.map(issue => {
            console.log('Processing resolved issue (direct array):', issue);
            return {
              issue_id: issue.issue_id,
              title: issue.title,
              reporter_details: issue.reporter_details,
              category_name: issue.category_name,
              priority_name: issue.priority_name,
              status_name: issue.status_name,
              created_at: issue.created_at,
              resolved_at: issue.resolved_at
            };
          });
        }

        console.log('Final transformed resolved issues:', transformedResolvedIssues);
        console.log('Transformed resolved issues length:', transformedResolvedIssues.length);

        setIssues({
          assigned: transformedAssignedIssues,
          resolved: transformedResolvedIssues
        });

        setLoading(false);
        setAssignedLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        console.error('Error response:', error.response?.data);
        console.error('Error status:', error.response?.status);
        
        // Set default values in case of error
        setCriticalPriorityIssues([]);
        setStats({
          assigned: 0,
          responseRate: 0,
          resolvedThisWeek: 0,
          slaBreaches: 0
        });
        setIssues({
          assigned: [],
          resolved: []
        });
        setAssignedIssues([]);
        setLoading(false);
        setAssignedLoading(false);
      }
    };

    fetchData();
  }, [selectedTimeRange]);

  const calculateTimeLeft = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? `${diffDays} days left` : 'Overdue';
  };

  const calculateDaysAgo = (date) => {
    const now = new Date();
    const then = new Date(date);
    const diffTime = now - then;
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) {
      return 'just now';
    } else if (diffMinutes < 60) {
      return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    } else if (diffDays === 0) {
      return 'Today';
    } else {
      return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
    }
  };

  const handleIssueClick = (issueId) => {
    navigate(`/lecturer/issues/${issueId}`);
  };

  const handleIssueSelect = (e, issueId) => {
    e.stopPropagation();
    setCriticalPriorityIssues(prevIssues => 
      prevIssues.map(issue => 
        issue.id === issueId ? { ...issue, selected: !issue.selected } : issue
      )
    );
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'open':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority.toLowerCase()) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleTimeRangeChange = (e) => {
    setSelectedTimeRange(e.target.value);
  };

  // Filter issues based on selected category and status
  const filteredIssues = {
    assigned: issues.assigned.filter(issue => {
      const matchesCategory = selectedCategory === 'all' || 
        (issue.category_name && issue.category_name.toLowerCase() === selectedCategory.toLowerCase());
      const matchesStatus = selectedStatus === 'all' || 
        (issue.status_name && issue.status_name.toLowerCase() === selectedStatus.toLowerCase());
      return matchesCategory && matchesStatus;
    }),
    resolved: issues.resolved.filter(issue => {
      const matchesCategory = selectedCategory === 'all' || 
        (issue.category_name && issue.category_name.toLowerCase() === selectedCategory.toLowerCase());
      const matchesStatus = selectedStatus === 'all' || 
        (issue.status_name && issue.status_name.toLowerCase() === selectedStatus.toLowerCase());
      return matchesCategory && matchesStatus;
    })
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Lecturer Dashboard</h1>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search issues..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {/* Create New Issue button temporarily disabled
          <Link
            to="/lecturer/issues/create"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Create New Issue
          </Link>
          */}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Assigned Issues</div>
          <div className="text-2xl font-semibold text-gray-900">{stats.assigned}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Response Rate</div>
          <div className="text-2xl font-semibold text-gray-900">{stats.responseRate}%</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Resolved This Week</div>
          <div className="text-2xl font-semibold text-gray-900">{stats.resolvedThisWeek}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">SLA Breaches</div>
          <div className="text-2xl font-semibold text-gray-900">{stats.slaBreaches}</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Critical Priority Issues */}
        <div className="col-span-2">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">Critical Priority Issues</h2>
              <Link to="/lecturer/assigned" className="text-sm text-blue-600 hover:text-blue-500">
                View All
              </Link>
            </div>
            <div className="divide-y divide-gray-200">
              {loading ? (
                <div className="px-6 py-4 flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : criticalPriorityIssues.length === 0 ? (
                <div className="px-6 py-4 text-center text-gray-500">
                  No critical priority issues found
                </div>
              ) : (
                criticalPriorityIssues.map((issue) => (
                  <div 
                    key={issue.id} 
                    className="px-6 py-4 flex items-center group hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      checked={issue.selected}
                      onChange={(e) => handleIssueSelect(e, issue.id)}
                      className="h-4 w-4 text-blue-600 rounded border-gray-300 mr-4"
                    />
                    <div className="flex-1">
                      <div className="flex items-center">
                        <div className={`h-2 w-2 rounded-full mr-2 ${
                          issue.timeLeft === 'Overdue' ? 'bg-red-500' : 
                          issue.status?.toLowerCase() === 'in_progress' ? 'bg-blue-500' :
                          issue.status?.toLowerCase() === 'resolved' ? 'bg-green-500' :
                          'bg-yellow-500'
                        }`}></div>
                        <h3 className="text-sm font-medium text-gray-900 group-hover:text-blue-600">
                          {issue.title}
                          <span className="ml-2 text-xs text-gray-500">#{issue.id}</span>
                        </h3>
                      </div>
                      <div className="mt-1 flex items-center text-sm text-gray-500">
                        <span>{issue.daysAgo}</span>
                        {issue.timeLeft && (
                          <>
                            <span className="mx-2">•</span>
                            <span className={`${issue.timeLeft === 'Overdue' ? 'text-red-500' : 'text-gray-500'}`}>
                              {issue.timeLeft}
                            </span>
                          </>
                        )}
                        {issue.priority && (
                          <>
                            <span className="mx-2">•</span>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(issue.priority)}`}>
                              {issue.priority}
                            </span>
                          </>
                        )}
                        {issue.status && (
                          <>
                            <span className="mx-2">•</span>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(issue.status)}`}>
                              {issue.status}
                            </span>
                          </>
                        )}
                        {issue.category && (
                          <>
                            <span className="mx-2">•</span>
                            <span className="text-gray-500">
                              {issue.category}
                            </span>
                          </>
                        )}
                        {issue.reporter && (
                          <>
                            <span className="mx-2">•</span>
                            <span className="text-gray-500">
                              Reported by {issue.reporter}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <button
                        className="text-gray-400 hover:text-gray-500"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleIssueClick(issue.id);
                        }}
                      >
                        <span className="sr-only">View issue details</span>
                        <EllipsisHorizontalIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Category Distribution */}
        <div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-medium text-gray-900">Category Distribution</h2>
              <select 
                className="text-sm border-gray-300 rounded-md"
                value={selectedTimeRange}
                onChange={handleTimeRangeChange}
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
              </select>
            </div>
            <div className="space-y-4">
              {categoryDistribution.map((category) => (
                <div key={category.category_id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{category.category_name}</span>
                    <span>{category.count}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full">
                    <div 
                      className="h-2 rounded-full" 
                      style={{ 
                        width: `${(category.count / categoryDistribution.reduce((sum, c) => sum + c.count, 0)) * 100}%`,
                        backgroundColor: getCategoryColor(category.category_name)
                      }}
                    ></div>
                  </div>
                </div>
              ))}
              {categoryDistribution.length === 0 && (
                <div className="text-center text-gray-500 py-4">
                  No category data available
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabbed Issue List Section */}
      <div className="mt-8">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="px-8 -mb-px flex space-x-8">
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'assigned'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('assigned')}
            >
              My Assigned Issues ({filteredIssues.assigned.length})
            </button>
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'resolved'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('resolved')}
            >
              Recently Resolved ({filteredIssues.resolved.length})
            </button>
          </div>
        </div>

        {/* Filters and Table */}
        <div className="px-8 py-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">
              {activeTab === 'assigned' ? 'My Assigned Issues' : 'Recently Resolved Issues'}
            </h2>
            <div className="flex items-center space-x-4">
              <select 
                className="text-sm border-gray-300 rounded-md"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category.category_id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
              <select 
                className="text-sm border-gray-300 rounded-md"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                {statuses.map(status => (
                  <option key={status.id} value={status.name}>
                    {status.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* My Assigned Issues Tab */}
          {activeTab === 'assigned' && (
            <div className="bg-white shadow-sm rounded-lg border border-gray-200">
              <div className="p-6">
                {assignedLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : filteredIssues.assigned.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    No assigned issues found
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr className="bg-gray-50">
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">#ID</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reporter</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredIssues.assigned.map((issue) => (
                          <tr 
                            key={issue.issue_id}
                            className="hover:bg-gray-50"
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">#{issue.issue_id}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{issue.title}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {issue.reporter_details?.full_name || 'Unknown'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{issue.category_name}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(issue.priority_name)}`}>
                                {issue.priority_name}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(issue.status_name)}`}>
                                {issue.status_name}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {calculateDaysAgo(issue.created_at)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {issue.due_date ? calculateTimeLeft(issue.due_date) : 'No due date'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Recently Resolved Issues Tab */}
          {activeTab === 'resolved' && (
            <div className="bg-white shadow-sm rounded-lg border border-gray-200">
              <div className="p-6">
                {loading ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : filteredIssues.resolved.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    No resolved issues found
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr className="bg-gray-50">
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">#ID</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reporter</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Resolved</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredIssues.resolved.map((issue) => (
                          <tr 
                            key={issue.issue_id}
                            className="hover:bg-gray-50"
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">#{issue.issue_id}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{issue.title}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {issue.reporter_details?.full_name || 'Unknown'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{issue.category_name}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(issue.priority_name)}`}>
                                {issue.priority_name}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(issue.status_name)}`}>
                                {issue.status_name}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {calculateDaysAgo(issue.created_at)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {calculateDaysAgo(issue.resolved_at)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper function to get category color
const getCategoryColor = (categoryName) => {
  const colors = {
    'Academic': '#3B82F6', // blue
    'Administrative': '#EF4444', // red
    'Technical Support': '#10B981', // green
    'Registration': '#F59E0B', // yellow
    'General': '#6B7280', // gray
    'Grading': '#8B5CF6', // purple
    'Financial': '#EC4899', // pink
    'Library': '#14B8A6', // teal
    'IT Services': '#6366F1', // indigo
    'Campus Security': '#F97316', // orange
    'Facilities': '#84CC16' // lime
  };

  return colors[categoryName] || '#3B82F6'; // Default to blue if category not found
};

export default LecturerDashboard; 