import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faSearch,
  faSave,
  faTimes,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import { getAllIssues, updateIssue, getLecturersAndAdmins, getStatuses } from '../../services/api';
import '../../utils/fontawesome';

const Issues = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingIssue, setEditingIssue] = useState(null);
  const [lecturersAndAdmins, setLecturersAndAdmins] = useState([]);
  const [statusList, setStatusList] = useState([]);

  const categories = ['all', 'Technical', 'Access', 'Academic', 'Administrative', 'Other'];
  const priorities = ['all', 'Low', 'Medium', 'High', 'Critical'];
  const statusNames = ['all', 'Open', 'In Progress', 'Resolved', 'Closed'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch issues
        console.log('Fetching all issues...');
        const issuesResponse = await getAllIssues();
        console.log('Raw API Response:', issuesResponse);
        
        if (Array.isArray(issuesResponse)) {
          // Process each issue to ensure assignee data is properly structured
          const processedIssues = issuesResponse.map(issue => {
            // Ensure assignee data is properly structured
            if (issue.assignee) {
              return {
                ...issue,
                assignee: {
                  user_id: issue.assignee.user_id,
                  full_name: issue.assignee.full_name || issue.assignee_details?.full_name,
                  user_type: issue.assignee.user_type || issue.assignee_details?.user_type
                }
              };
            }
            return issue;
          });
          
          setIssues(processedIssues);
        } else if (issuesResponse && issuesResponse.data) {
          console.log('Setting issues from response.data:', issuesResponse.data);
          setIssues(issuesResponse.data);
        } else {
          console.error('Issues data is not in expected format:', issuesResponse);
          setError('Failed to load issues. Please try again.');
        }

        // Fetch statuses from backend
        try {
          const statusResponse = await getStatuses();
          console.log('Fetched statuses:', statusResponse);
          if (Array.isArray(statusResponse)) {
            setStatusList(statusResponse);
          } else {
            console.error('Status data is not in expected format:', statusResponse);
          }
        } catch (error) {
          console.error('Error fetching statuses:', error);
        }

        // Fetch lecturers and admins
        try {
          const staffResponse = await getLecturersAndAdmins();
          if (Array.isArray(staffResponse)) {
            setLecturersAndAdmins(staffResponse);
          } else {
            console.error('Staff data is not in expected format:', staffResponse);
            setError('Failed to load staff data. Please try again.');
          }
        } catch (staffError) {
          console.error('Error fetching staff:', staffError);
          setError('Failed to load staff data. Please try again.');
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load data. Please try again.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredIssues = (issues || [])
    .filter(issue => {
      if (!issue) return false;
      
      const matchesSearch = 
        issue.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.reporter?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = filterCategory === 'all' || 
        (issue.category?.name || issue.category_name) === filterCategory;
      const matchesPriority = filterPriority === 'all' || 
        (issue.priority?.name || issue.priority_name) === filterPriority;
      const matchesStatus = filterStatus === 'all' || 
        (issue.status?.name || issue.status_name) === filterStatus;

      return matchesSearch && matchesCategory && matchesPriority && matchesStatus;
    })
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const handleAddIssue = () => {
    setShowAddForm(true);
    setEditingIssue(null);
  };

  const handleSaveIssue = async (issueData) => {
    try {
      if (editingIssue) {
        const response = await updateIssue(editingIssue.id, issueData);
        setIssues(issues.map(issue => 
          issue.id === editingIssue.id ? response.data : issue
        ));
        setEditingIssue(null);
      } else {
        // Handle new issue creation
        // This would typically be handled by a separate API call
        setShowAddForm(false);
      }
    } catch (error) {
      console.error('Error saving issue:', error);
      setError('Failed to save issue. Please try again.');
    }
  };

  const handleStatusChange = async (issueId, newStatusName) => {
    if (!issueId) {
      console.error('Issue ID is missing:', issueId);
      setError('Cannot update issue: Missing issue ID');
      return;
    }

    try {
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
    } catch (error) {
      console.error('Error updating issue status:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data
      });
      setError(error.response?.data?.detail || 'Failed to update issue status. Please try again.');
    }
  };

  // Helper function to get consistent issue ID
  const getIssueId = (issue) => {
    // This function ensures we always get a valid issue ID
    return issue.issue_id || issue.id;
  };

  const handleAssigneeChange = async (issueId, newAssigneeId) => {
    try {
      console.log('Updating assignee:', { issueId, newAssigneeId });
      if (!issueId) {
        throw new Error('Issue ID is undefined');
      }
      
      // Convert empty string to null for backend compatibility
      const assigneeValue = newAssigneeId === '' ? null : newAssigneeId;
      
      // Make the API call with explicit payload structure
      const response = await updateIssue(issueId, { 
        assignee: assigneeValue 
      });
      
      console.log('Assignee update response:', response);
      
      // Find the staff member from our list for immediate UI update
      const selectedStaff = assigneeValue 
        ? lecturersAndAdmins.find(staff => staff.user_id.toString() === assigneeValue.toString())
        : null;
      
      // Use the response to update the UI if available, otherwise use our local data
      if (response && response.data) {
        setIssues(prevIssues => prevIssues.map(issue => {
          if (getIssueId(issue) === issueId) {
            return {
              ...issue,
              assignee: response.data.assignee_details || selectedStaff,
              assignee_details: response.data.assignee_details || selectedStaff,
              updated_at: response.data.updated_at || new Date().toISOString()
            };
          }
          return issue;
        }));
      } else {
        // Fallback to optimistic update if response doesn't contain expected data
        setIssues(prevIssues => prevIssues.map(issue => {
          if (getIssueId(issue) === issueId) {
            return {
              ...issue,
              assignee: selectedStaff,
              assignee_details: selectedStaff,
              updated_at: new Date().toISOString()
            };
          }
          return issue;
        }));
      }
      
      // Clear any error message
      setError('');
      
    } catch (error) {
      console.error('Error updating issue assignee:', error);
      console.error('Error details:', error.response?.data || error.message);
      
      // Show the error to the user
      setError(`Failed to update assignee: ${error.response?.data?.detail || error.message || 'Unknown error'}`);
      
      // After 3 seconds, clear the error message
      setTimeout(() => setError(''), 3000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-[#1e1e77]">Issue Management</h1>
        <button
          onClick={handleAddIssue}
          className="flex items-center gap-2 px-4 py-2 bg-[#1e1e77] text-white rounded-lg hover:bg-[#2a2a8f]"
        >
          <FontAwesomeIcon icon={faPlus} />
          Add Issue
        </button>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 grid grid-cols-4 gap-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search issues..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
            value={searchTerm}
            onChange={handleSearch}
          />
          <FontAwesomeIcon
            icon={faSearch}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        >
          {categories.map(category => (
            <option key={`category-${category}`} value={category}>
              {category === 'all' ? 'All Categories' : category}
            </option>
          ))}
        </select>
        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        >
          {priorities.map(priority => (
            <option key={`priority-${priority}`} value={priority}>
              {priority === 'all' ? 'All Priorities' : priority}
            </option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        >
          {statusNames.map(status => (
            <option key={`status-${status}`} value={status}>
              {status === 'all' ? 'All Statuses' : status}
            </option>
          ))}
        </select>
      </div>

      {/* Issue Form */}
      {(showAddForm || editingIssue) && (
        <IssueForm
          issue={editingIssue}
          onSave={handleSaveIssue}
          onCancel={() => {
            setShowAddForm(false);
            setEditingIssue(null);
          }}
        />
      )}

      {/* Issues Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issue</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredIssues.map((issue, index) => {
              console.log('Rendering issue:', {
                id: issue.id || issue.issue_id,
                title: issue.title,
                status: issue.status
              });
              return (
                <tr key={`issue-${issue.id || issue.issue_id || index}-${issue.title || 'untitled'}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-[#1e1e77] text-white flex items-center justify-center">
                          <FontAwesomeIcon icon={faExclamationTriangle} className="text-xl" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{issue.title}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {issue.category?.name || issue.category_name || 'Uncategorized'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                      ${(issue.priority?.name || issue.priority_name) === 'Critical' ? 'bg-red-100 text-red-800' :
                        (issue.priority?.name || issue.priority_name) === 'High' ? 'bg-orange-100 text-orange-800' :
                        (issue.priority?.name || issue.priority_name) === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'}`}>
                      {issue.priority?.name || issue.priority_name || 'Not Set'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                      ${(issue.status?.name || issue.status_name) === 'Open' ? 'bg-green-100 text-green-800' :
                        (issue.status?.name || issue.status_name) === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                        (issue.status?.name || issue.status_name) === 'Resolved' ? 'bg-gray-100 text-gray-800' :
                        'bg-gray-100 text-gray-800'}`}>
                      {issue.status?.name || issue.status_name || 'Not Set'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={issue.assignee?.user_id || issue.assignee_details?.user_id || ''}
                      onChange={(e) => {
                        const issueId = getIssueId(issue);
                        console.log('Changing assignee for issue:', {
                          issueId,
                          currentAssignee: issue.assignee?.user_id || issue.assignee_details?.user_id,
                          newAssignee: e.target.value
                        });
                        if (issueId) {
                          handleAssigneeChange(issueId, e.target.value);
                        } else {
                          console.error('Missing issue ID for assignee update. Full issue:', issue);
                        }
                      }}
                      className="text-sm border rounded px-1 py-0.5"
                    >
                      <option key="unassigned" value="">Unassigned</option>
                      {lecturersAndAdmins.map(staff => (
                        <option key={`staff-${staff.user_id}`} value={staff.user_id}>
                          {staff.full_name}
                        </option>
                      ))}
                    </select>
                    {(issue.assignee || issue.assignee_details) && (
                      <div className="mt-1">
                        <span className="text-xs font-medium text-gray-900">
                          {issue.assignee?.full_name || issue.assignee_details?.full_name || (issue.assignee?.user_id ? 'Loading...' : 'Unassigned')}
                        </span>
                        {(issue.assignee?.user_type || issue.assignee_details?.user_type) && (
                          <span className="text-xs text-gray-500 ml-1">
                            ({issue.assignee?.user_type || issue.assignee_details?.user_type})
                          </span>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(issue.updated_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <select
                      value={issue.status?.name || issue.status_name || 'Open'}
                      onChange={(e) => {
                        const issueId = getIssueId(issue);
                        console.log('Updating status for issue:', {
                          issueId,
                          currentStatus: issue.status?.name || issue.status_name,
                          newStatus: e.target.value,
                          availableStatuses: statusList.map(s => s.name)
                        });
                        if (issueId) {
                          handleStatusChange(issueId, e.target.value);
                        } else {
                          console.error('Missing issue ID for status update. Full issue:', issue);
                        }
                      }}
                      className="text-sm border rounded px-1 py-0.5"
                    >
                      {statusList.length > 0 
                        ? statusList.map(status => (
                            <option key={`status-option-${status.status_id}`} value={status.name}>
                              {status.name}
                            </option>
                          ))
                        : statusNames.filter(status => status !== 'all').map(status => (
                            <option key={`status-option-${status}`} value={status}>
                              {status}
                            </option>
                          ))
                      }
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const IssueForm = ({ issue, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: issue?.title || '',
    description: issue?.description || '',
    category: issue?.category || '',
    priority: issue?.priority || 'Medium',
    status: issue?.status || 'Open',
    assignedTo: issue?.assignedTo || '',
    reportedBy: issue?.reportedBy || ''
  });

  const categories = ['Technical', 'Access', 'Academic', 'Administrative', 'Other'];
  const priorities = ['Low', 'Medium', 'High', 'Critical'];
  const statuses = ['Open', 'In Progress', 'Resolved', 'Closed'];

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        {issue ? 'Edit Issue' : 'Add New Issue'}
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Enter issue title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              required
            >
              <option value="">Select Category</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              required
            >
              {priorities.map(priority => (
                <option key={priority} value={priority}>
                  {priority}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              required
            >
              {statuses.map(status => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
            <input
              type="text"
              required
              value={formData.assignedTo}
              onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Enter assigned person/team"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reported By</label>
            <input
              type="text"
              required
              value={formData.reportedBy}
              onChange={(e) => setFormData({ ...formData, reportedBy: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Enter reporter name"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              rows="4"
              placeholder="Enter issue description"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            <FontAwesomeIcon icon={faTimes} className="mr-2" />
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-[#1e1e77] text-white rounded hover:bg-[#2a2a8f]"
          >
            <FontAwesomeIcon icon={faSave} className="mr-2" />
            Save
          </button>
        </div>
      </form>
    </div>
  );
};

export default Issues; 