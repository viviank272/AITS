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
import axios from 'axios';

function LecturerDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    assigned: 0,
    departmentIssues: 0,
    responseRate: 0,
    resolvedThisWeek: 0,
    slaBreaches: 0
  });
  const [criticalPriorityIssues, setCriticalPriorityIssues] = useState([]);
  const [activeTab, setActiveTab] = useState('assigned');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [issues, setIssues] = useState({
    assigned: [],
    department: [],
    resolved: []
  });
  const [categoryDistribution, setCategoryDistribution] = useState([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState('7');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch critical priority issues
        const criticalResponse = await axios.get('/api/issues/lecturer/', {
          params: {
            priority: 'critical',
            limit: 5
          }
        });

        // Fetch category distribution
        const categoryResponse = await axios.get('/api/issues/category-distribution/', {
          params: {
            time_range: selectedTimeRange
          }
        });

        // Transform the data to match the frontend format
        const transformedCriticalIssues = criticalResponse.data?.results?.map(issue => ({
          id: issue.issue_id,
          title: issue.title,
          timeLeft: issue.due_date ? calculateTimeLeft(issue.due_date) : '',
          status: issue.status_name,
          daysAgo: calculateDaysAgo(issue.created_at),
          selected: false
        })) || [];

        setCriticalPriorityIssues(transformedCriticalIssues);
        setCategoryDistribution(categoryResponse.data?.results || []);

        // Fetch stats
        const statsResponse = await axios.get('/api/issues/stats/');
        setStats(statsResponse.data || {
          assigned: 0,
          departmentIssues: 0,
          responseRate: 0,
          resolvedThisWeek: 0,
          slaBreaches: 0
        });

        // Fetch other issues
        const assignedResponse = await axios.get('/api/issues/lecturer/', {
          params: { assigned: true }
        });
        const departmentResponse = await axios.get('/api/issues/lecturer/', {
          params: { department: true }
        });
        const resolvedResponse = await axios.get('/api/issues/lecturer/', {
          params: { resolved: true }
        });

        setIssues({
          assigned: assignedResponse.data?.results || [],
          department: departmentResponse.data?.results || [],
          resolved: resolvedResponse.data?.results || []
        });

        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        console.error('Error response:', error.response?.data);
        setLoading(false);
        // Set default values in case of error
        setCriticalPriorityIssues([]);
        setStats({
          assigned: 0,
          departmentIssues: 0,
          responseRate: 0,
          resolvedThisWeek: 0,
          slaBreaches: 0
        });
        setIssues({
          assigned: [],
          department: [],
          resolved: []
        });
      }
    };

    fetchData();
  }, []);

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
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays === 0 ? 'Today' : `${diffDays} days ago`;
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

  const getFilteredIssues = () => {
    let filteredIssues = issues[activeTab];

    if (selectedCategory !== 'All Categories') {
      filteredIssues = filteredIssues.filter(issue => issue.category === selectedCategory);
    }

    if (selectedStatus !== 'All Status') {
      filteredIssues = filteredIssues.filter(issue => issue.status === selectedStatus);
    }

    if (searchTerm) {
      filteredIssues = filteredIssues.filter(issue =>
        issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.student.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filteredIssues;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'SLA':
        return 'bg-red-100 text-red-800';
      case 'Multiple students':
        return 'bg-yellow-100 text-yellow-800';
      case '5 comments':
        return 'bg-blue-100 text-blue-800';
      case 'Urgent':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleTimeRangeChange = (e) => {
    setSelectedTimeRange(e.target.value);
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
          <Link
            to="/lecturer/issues/create"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Create New Issue
          </Link>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Assigned Issues</div>
          <div className="text-2xl font-semibold text-gray-900">{stats.assigned}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Department Issues</div>
          <div className="text-2xl font-semibold text-gray-900">{stats.departmentIssues}</div>
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
              <Link to="/lecturer/issues" className="text-sm text-blue-600 hover:text-blue-500">
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
                    className="px-6 py-4 flex items-center group cursor-pointer hover:bg-gray-50"
                    onClick={() => handleIssueClick(issue.id)}
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
                          issue.status === 'Urgent' ? 'bg-orange-500' : 'bg-yellow-500'
                        }`}></div>
                        <h3 className="text-sm font-medium text-gray-900 group-hover:text-blue-600">
                          {issue.title}
                          <span className="ml-2 text-xs text-gray-500">#{issue.id}</span>
                        </h3>
                      </div>
                      <div className="mt-1 flex items-center text-sm text-gray-500">
                        <span>{issue.daysAgo === 0 ? 'Today' : issue.daysAgo === 1 ? 'Yesterday' : `${issue.daysAgo} days ago`}</span>
                        {issue.timeLeft && (
                          <>
                            <span className="mx-2">•</span>
                            <span className={`${issue.timeLeft === 'Overdue' ? 'text-red-500' : 'text-gray-500'}`}>
                              {issue.timeLeft}
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
                <div key={category.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{category.name}</span>
                    <span>{category.percentage}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full">
                    <div 
                      className="h-2 rounded-full" 
                      style={{ 
                        width: `${category.percentage}%`,
                        backgroundColor: category.color || '#3B82F6'
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
              My Assigned Issues ({issues.assigned.length})
            </button>
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'department'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('department')}
            >
              Department Issues ({issues.department.length})
            </button>
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'resolved'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('resolved')}
            >
              Recently Resolved ({issues.resolved.length})
            </button>
          </div>
        </div>

        {/* Filters and Table */}
        <div className="px-8 py-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">
              {activeTab === 'assigned' && 'My Assigned Issues'}
              {activeTab === 'department' && 'Department Issues'}
              {activeTab === 'resolved' && 'Recently Resolved Issues'}
            </h2>
            <div className="flex items-center space-x-4">
              <select 
                className="text-sm border-gray-300 rounded-md"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option>All Categories</option>
                <option>Course Registration</option>
                <option>Technical Support</option>
                <option>Academic Advising</option>
                <option>Grading</option>
                <option>Facilities</option>
              </select>
              <select 
                className="text-sm border-gray-300 rounded-md"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option>All Status</option>
                <option>Open</option>
                <option>In Progress</option>
                <option>Resolved</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">#ID</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {activeTab === 'resolved' ? 'Resolved Date' : 'SLA'}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {getFilteredIssues().map((issue) => (
                  <tr 
                    key={issue.id} 
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleIssueClick(issue.id)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{issue.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{issue.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{issue.student}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{issue.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        issue.priority === 'High' ? 'bg-red-100 text-red-800' :
                        issue.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {issue.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        issue.status === 'Open' ? 'bg-blue-100 text-blue-800' :
                        issue.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {issue.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm ${
                        activeTab === 'resolved' 
                          ? 'text-gray-500' 
                          : issue.sla === 'Overdue' 
                            ? 'text-red-600 font-medium' 
                            : 'text-gray-500'
                      }`}>
                        {activeTab === 'resolved' ? issue.resolvedDate : issue.sla}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        className="text-gray-400 hover:text-gray-500"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Handle actions menu
                        }}
                      >
                        <EllipsisHorizontalIcon className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LecturerDashboard; 