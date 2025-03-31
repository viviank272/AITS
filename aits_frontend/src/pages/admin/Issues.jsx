import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faEdit,
  faTrash,
  faSearch,
  faFilter,
  faSave,
  faTimes,
  faExclamationTriangle,
  faCheckCircle,
  faClock,
  faUser,
  faTag
} from '@fortawesome/free-solid-svg-icons';
import '../../utils/fontawesome';

const Issues = () => {
  const [issues, setIssues] = useState([
    {
      id: 1,
      title: 'Network Connection Issues',
      description: 'Unable to connect to the university network in the library',
      category: 'Technical',
      priority: 'High',
      status: 'Open',
      assignedTo: 'IT Support',
      reportedBy: 'John Doe',
      dateReported: '2024-03-15 10:30 AM',
      lastUpdated: '2024-03-15 11:15 AM'
    },
    {
      id: 2,
      title: 'Library Access Card Not Working',
      description: 'Student ID card not being recognized at library entrance',
      category: 'Access',
      priority: 'Medium',
      status: 'In Progress',
      assignedTo: 'Library Staff',
      reportedBy: 'Jane Smith',
      dateReported: '2024-03-14 02:15 PM',
      lastUpdated: '2024-03-15 09:45 AM'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingIssue, setEditingIssue] = useState(null);

  const categories = ['all', 'Technical', 'Access', 'Academic', 'Administrative', 'Other'];
  const priorities = ['all', 'Low', 'Medium', 'High', 'Critical'];
  const statuses = ['all', 'Open', 'In Progress', 'Resolved', 'Closed'];

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredIssues = issues.filter(issue => {
    const matchesSearch = 
      issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.reportedBy.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === 'all' || issue.category === filterCategory;
    const matchesPriority = filterPriority === 'all' || issue.priority === filterPriority;
    const matchesStatus = filterStatus === 'all' || issue.status === filterStatus;

    return matchesSearch && matchesCategory && matchesPriority && matchesStatus;
  });

  const handleAddIssue = () => {
    setShowAddForm(true);
    setEditingIssue(null);
  };

  const handleSaveIssue = (issueData) => {
    if (editingIssue) {
      setIssues(issues.map(issue => 
        issue.id === editingIssue.id ? { ...issue, ...issueData } : issue
      ));
      setEditingIssue(null);
    } else {
      setIssues([...issues, { 
        ...issueData, 
        id: Date.now(),
        dateReported: new Date().toLocaleString(),
        lastUpdated: new Date().toLocaleString()
      }]);
      setShowAddForm(false);
    }
  };

  const handleDeleteIssue = (issueId) => {
    if (window.confirm('Are you sure you want to delete this issue?')) {
      setIssues(issues.filter(issue => issue.id !== issueId));
    }
  };

  const handleStatusChange = (issueId, newStatus) => {
    setIssues(issues.map(issue => 
      issue.id === issueId 
        ? { 
            ...issue, 
            status: newStatus,
            lastUpdated: new Date().toLocaleString()
          } 
        : issue
    ));
  };

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
            <option key={category} value={category}>
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
            <option key={priority} value={priority}>
              {priority === 'all' ? 'All Priorities' : priority}
            </option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        >
          {statuses.map(status => (
            <option key={status} value={status}>
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
            {filteredIssues.map(issue => (
              <tr key={issue.id}>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-[#1e1e77] text-white flex items-center justify-center">
                        <FontAwesomeIcon icon={faExclamationTriangle} className="text-xl" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{issue.title}</div>
                      <div className="text-sm text-gray-500">{issue.description}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    {issue.category}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                    ${issue.priority === 'Critical' ? 'bg-red-100 text-red-800' :
                      issue.priority === 'High' ? 'bg-orange-100 text-orange-800' :
                      issue.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'}`}>
                    {issue.priority}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                    ${issue.status === 'Open' ? 'bg-red-100 text-red-800' :
                      issue.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                      issue.status === 'Resolved' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'}`}>
                    {issue.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {issue.assignedTo}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {issue.lastUpdated}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => setEditingIssue(issue)}
                    className="text-blue-600 hover:text-blue-900 mx-2"
                    title="Edit Issue"
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                  <button
                    onClick={() => handleDeleteIssue(issue.id)}
                    className="text-red-600 hover:text-red-900 mx-2"
                    title="Delete Issue"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                  <select
                    value={issue.status}
                    onChange={(e) => handleStatusChange(issue.id, e.target.value)}
                    className="text-sm border rounded px-1 py-0.5"
                  >
                    {statuses.filter(status => status !== 'all').map(status => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
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