import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ChevronDownIcon,
  EllipsisVerticalIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { getLecturerIssues, updateIssue, deleteIssue, getStatuses, getCategories } from '../../services/api';
import { toast } from 'react-toastify';

const AssignedIssues = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedTimeframe, setSelectedTimeframe] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showActionsMenu, setShowActionsMenu] = useState(null);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const actionsMenuRef = React.useRef(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [statusList, setStatusList] = useState([]);
  const [categoryList, setCategoryList] = useState([]);

  useEffect(() => {
    fetchAssignedIssues();
    fetchStatuses();
    fetchCategories();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (actionsMenuRef.current && !actionsMenuRef.current.contains(event.target)) {
        setShowActionsMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await getCategories();
      console.log('Fetched categories:', response);
      if (Array.isArray(response)) {
        setCategoryList(response);
      } else {
        console.error('Category data is not in expected format:', response);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchStatuses = async () => {
    try {
      const response = await getStatuses();
      console.log('Fetched statuses:', response);
      if (Array.isArray(response)) {
        setStatusList(response);
      } else {
        console.error('Status data is not in expected format:', response);
      }
    } catch (error) {
      console.error('Error fetching statuses:', error);
    }
  };

  const fetchAssignedIssues = async () => {
    try {
      setLoading(true);
      const response = await getLecturerIssues({ assigned: true });
      
      console.log('Fetched assigned issues:', response);
      
      if (Array.isArray(response)) {
        setIssues(response);
      } else if (response.results) {
        setIssues(response.results);
      } else {
        setIssues([]);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching assigned issues:', err);
      setError('Failed to load assigned issues. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const priorities = [
    { id: 'all', name: 'All Priorities' },
    { id: 'critical', name: 'Critical Priority' },
    { id: 'high', name: 'High Priority' },
    { id: 'medium', name: 'Medium Priority' },
    { id: 'low', name: 'Low Priority' }
  ];

  const statuses = [
    { id: 'all', name: 'All Status' },
    { id: 'pending', name: 'Pending' },
    { id: 'in_progress', name: 'In Progress' },
    { id: 'resolved', name: 'Resolved' }
  ];

  const timeframes = [
    { id: 'all', name: 'All Time' },
    { id: 'today', name: 'Today' },
    { id: 'week', name: 'This Week' },
    { id: 'month', name: 'This Month' }
  ];

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'open':
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in progress':
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'critical':
        return 'text-red-800';
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const handleIssueClick = (issueId) => {
    navigate(`/lecturer/issues/${issueId}`);
  };

  const handleStatusChange = async (issueId, newStatusName) => {
    if (!issueId) {
      console.error('Issue ID is missing:', issueId);
      setError('Cannot update issue: Missing issue ID');
      return;
    }

    try {
      setIsUpdating(true);
      // Find the status object that matches the new status name
      const statusObj = statusList.find(s => s.name.toLowerCase() === newStatusName.toLowerCase());
      if (!statusObj) {
        console.error('Status not found:', newStatusName);
        console.log('Available statuses:', statusList);
        setError('Invalid status selected');
        return;
      }

      console.log('Updating status with:', {
        issueId,
        newStatusName,
        statusObj
      });

      // Create FormData for the update
      const formData = new FormData();
      formData.append('status', statusObj.status_id);

      // Update in the backend
      const response = await updateIssue(issueId, formData);
      console.log('Update response:', response);
      
      // Update the local state with the new status
      setIssues(prevIssues => prevIssues.map(issue => {
        if (issue.id === issueId || issue.issue_id === issueId) {
          return {
            ...issue,
            status: statusObj,
            status_name: statusObj.name,
            updated_at: new Date().toISOString()
          };
        }
        return issue;
      }));

      // Clear any existing error
      setError('');
      toast.success(`Issue status updated to ${statusObj.name}`);
    } catch (error) {
      console.error('Error updating issue status:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data
      });
      setError(error.response?.data?.detail || 'Failed to update issue status. Please try again.');
      toast.error('Failed to update issue status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleActionsClick = (e, issueId) => {
    e.stopPropagation();
    setShowActionsMenu(showActionsMenu === issueId ? null : issueId);
  };

  const handleViewIssue = (e, issueId) => {
    e.stopPropagation();
    navigate(`/lecturer/issues/${issueId}`);
  };

  const handleEditIssue = (e, issueId) => {
    e.stopPropagation();
    navigate(`/lecturer/issues/${issueId}/edit`);
  };

  const handleDeleteIssue = async (e, issueId) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this issue?')) {
      try {
        setIsDeleting(true);
        await deleteIssue(issueId);
        setIssues(prevIssues => prevIssues.filter(issue => issue.issue_id !== issueId));
        toast.success('Issue deleted successfully');
      } catch (error) {
        console.error('Error deleting issue:', error);
        toast.error(error.response?.data?.message || 'Failed to delete issue');
      } finally {
        setIsDeleting(false);
        setShowActionsMenu(null);
      }
    }
  };

  // Filter issues based on search and filters
  const filteredIssues = issues.filter(issue => {
    const matchesSearch = searchQuery === '' || 
      (issue.title && issue.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (issue.issue_id && issue.issue_id.toString().includes(searchQuery)) ||
      (issue.reporter_details?.full_name && issue.reporter_details.full_name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesPriority = selectedPriority === 'all' || 
      (issue.priority_name && issue.priority_name.toLowerCase() === selectedPriority) ||
      (issue.priority?.name && issue.priority.name.toLowerCase() === selectedPriority);

    const matchesStatus = selectedStatus === 'all' || 
      (issue.status_name && issue.status_name.toLowerCase().replace(' ', '_') === selectedStatus) ||
      (issue.status?.name && issue.status.name.toLowerCase().replace(' ', '_') === selectedStatus);

    const matchesCategory = selectedCategory === 'all' || 
      (issue.category_name && issue.category_name.toLowerCase() === selectedCategory.toLowerCase()) ||
      (issue.category?.name && issue.category.name.toLowerCase() === selectedCategory.toLowerCase());

    // Timeframe filtering would need date comparison logic
    const matchesTimeframe = selectedTimeframe === 'all'; // Simplified for now

    return matchesSearch && matchesPriority && matchesStatus && matchesCategory && matchesTimeframe;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
        <button 
          onClick={fetchAssignedIssues}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Assigned Issues</h1>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search issues..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex space-x-4 mb-6">
        <select
          className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="all">All Categories</option>
          {categoryList.map(category => (
            <option key={category.id} value={category.name}>
              {category.name}
            </option>
          ))}
        </select>

        <select
          className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={selectedPriority}
          onChange={(e) => setSelectedPriority(e.target.value)}
        >
          <option value="all">All Priorities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        <select
          className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>

        <select
          className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={selectedTimeframe}
          onChange={(e) => setSelectedTimeframe(e.target.value)}
        >
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
        </select>
      </div>

      {/* Issues Table */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
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
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredIssues.map((issue) => (
              <tr 
                key={issue.issue_id} 
                className="hover:bg-gray-50"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">#{issue.issue_id}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{issue.title}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {issue.reporter_details?.full_name || 'Unknown'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {issue.category_name || issue.category?.name || 'Uncategorized'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(issue.priority_name || issue.priority?.name)}`}>
                    {issue.priority_name || issue.priority?.name || 'Medium'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(issue.status_name || issue.status?.name)}`}>
                    {issue.status_name || issue.status?.name || 'Open'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(issue.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <select
                    value={issue.status?.name || issue.status_name || 'Open'}
                    onChange={(e) => {
                      console.log('Status change requested:', {
                        issueId: issue.issue_id,
                        currentStatus: issue.status?.name || issue.status_name,
                        newStatus: e.target.value
                      });
                      handleStatusChange(issue.issue_id, e.target.value);
                    }}
                    className="text-sm border rounded px-2 py-1 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isUpdating}
                  >
                    {statusList.length > 0 
                      ? statusList.map(status => (
                          <option key={`status-option-${status.status_id}`} value={status.name}>
                            {status.name}
                          </option>
                        ))
                      : ['Open', 'In Progress', 'Resolved', 'Closed'].map(status => (
                          <option key={`status-option-${status}`} value={status}>
                            {status}
                          </option>
                        ))
                    }
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AssignedIssues; 