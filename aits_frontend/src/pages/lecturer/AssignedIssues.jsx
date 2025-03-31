import React, { useState } from 'react';
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
  XMarkIcon
} from '@heroicons/react/24/outline';

const AssignedIssues = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedTimeframe, setSelectedTimeframe] = useState('all');
  const [showActionsMenu, setShowActionsMenu] = useState(null);

  // Sample data - replace with API call
  const [issues, setIssues] = useState([
    {
      id: 'ISS-2024-001',
      title: 'Unable to access course materials',
      student: 'John Doe',
      studentId: '2100100100',
      priority: 'high',
      status: 'pending',
      timeLeft: '2 days',
      createdAt: '2024-03-20',
      department: 'Computer Science'
    },
    {
      id: 'ISS-2024-002',
      title: 'Assignment submission error',
      student: 'Jane Smith',
      studentId: '2100100101',
      priority: 'medium',
      status: 'in_progress',
      timeLeft: '4 days',
      createdAt: '2024-03-19',
      department: 'Computer Science'
    }
  ]);

  const priorities = [
    { id: 'all', name: 'All Priorities' },
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
    switch (status) {
      case 'pending':
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
    switch (priority) {
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

  const handleStatusChange = (issueId, newStatus) => {
    setIssues(issues.map(issue => 
      issue.id === issueId 
        ? { ...issue, status: newStatus }
        : issue
    ));
    setShowActionsMenu(null);
  };

  const handleActionsClick = (e, issueId) => {
    e.stopPropagation();
    setShowActionsMenu(showActionsMenu === issueId ? null : issueId);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Assigned Issues</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage and track your assigned student issues
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Search */}
          <div className="md:col-span-2 relative">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by ID, title, or student name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Priority Filter */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {priorities.map((priority) => (
              <option key={priority.id} value={priority.id}>
                {priority.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {statuses.map((status) => (
              <option key={status.id} value={status.id}>
                {status.name}
              </option>
            ))}
          </select>

          {/* Timeframe Filter */}
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {timeframes.map((timeframe) => (
              <option key={timeframe.id} value={timeframe.id}>
                {timeframe.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Issues List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Issue Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time Left
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {issues.map((issue) => (
                <tr
                  key={issue.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleIssueClick(issue.id)}
                >
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <div className="text-sm font-medium text-gray-900">
                        {issue.id}
                      </div>
                      <div className="text-sm text-gray-500">{issue.title}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <div className="text-sm font-medium text-gray-900">
                        {issue.student}
                      </div>
                      <div className="text-sm text-gray-500">{issue.studentId}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`text-sm font-medium ${getPriorityColor(issue.priority)}`}>
                      {issue.priority.charAt(0).toUpperCase() + issue.priority.slice(1)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(issue.status)}`}>
                      {issue.status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{issue.timeLeft}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="relative">
                      <button 
                        className="text-gray-400 hover:text-gray-500"
                        onClick={(e) => handleActionsClick(e, issue.id)}
                      >
                        <EllipsisVerticalIcon className="h-5 w-5" />
                      </button>
                      {showActionsMenu === issue.id && (
                        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                          <div className="py-1" role="menu">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusChange(issue.id, 'resolved');
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                              role="menuitem"
                            >
                              <CheckCircleIcon className="h-5 w-5 mr-2 text-green-500" />
                              Resolve Issue
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusChange(issue.id, 'closed');
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                              role="menuitem"
                            >
                              <XMarkIcon className="h-5 w-5 mr-2 text-red-500" />
                              Close Issue
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AssignedIssues; 