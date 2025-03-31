import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useLocation } from 'react-router-dom';
import {
  faPlus,
  faEdit,
  faTrash,
  faSearch,
  faFilter,
  faSave,
  faTimes,
  faKey,
  faUser,
  faToggleOn,
  faToggleOff
} from '@fortawesome/free-solid-svg-icons';
import '../../utils/fontawesome';

const UserManagement = () => {
  const [users, setUsers] = useState([
    {
      id: 1,
      name: 'Dr. John Smith',
      email: 'john.smith@muk.ac.ug',
      role: 'lecturer',
      department: 'Computer Engineering',
      status: 'active',
      lastLogin: '2024-03-15 10:30 AM'
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      email: 'sarah.j@muk.ac.ug',
      role: 'student',
      department: 'Computer Engineering',
      status: 'active',
      lastLogin: '2024-03-14 02:15 PM'
    },
    {
      id: 3,
      name: 'Prof. Michael Brown',
      email: 'm.brown@muk.ac.ug',
      role: 'dean',
      department: 'College of Engineering',
      status: 'active',
      lastLogin: '2024-03-15 09:45 AM'
    }
  ]);

  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // Check URL parameters for actions
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const action = searchParams.get('action');
    
    if (action === 'add') {
      setShowAddForm(true);
    }
  }, [location]);

  const roles = ['all', 'student', 'lecturer', 'dean', 'admin'];
  const statuses = ['all', 'active', 'inactive', 'suspended'];

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.department.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleAddUser = () => {
    setShowAddForm(true);
    setEditingUser(null);
  };

  const handleSaveUser = (userData) => {
    if (editingUser) {
      setUsers(users.map(user => 
        user.id === editingUser.id ? { ...user, ...userData } : user
      ));
      setEditingUser(null);
    } else {
      setUsers([...users, { ...userData, id: Date.now(), lastLogin: 'Never' }]);
      setShowAddForm(false);
    }
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter(user => user.id !== userId));
    }
  };

  const handleToggleStatus = (userId) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' }
        : user
    ));
  };

  const handleResetPassword = (userId) => {
    // In a real application, this would trigger a password reset email
    alert('Password reset email has been sent to the user.');
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-[#1e1e77]">User Management</h1>
        <button
          onClick={handleAddUser}
          className="flex items-center gap-2 px-4 py-2 bg-[#1e1e77] text-white rounded-lg hover:bg-[#2a2a8f]"
        >
          <FontAwesomeIcon icon={faPlus} />
          Add User
        </button>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search users..."
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
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="px-4 py-2 border rounded-lg capitalize"
        >
          {roles.map(role => (
            <option key={role} value={role} className="capitalize">
              {role === 'all' ? 'All Roles' : role}
            </option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border rounded-lg capitalize"
        >
          {statuses.map(status => (
            <option key={status} value={status} className="capitalize">
              {status === 'all' ? 'All Statuses' : status}
            </option>
          ))}
        </select>
      </div>

      {/* User Form */}
      {(showAddForm || editingUser) && (
        <UserForm
          user={editingUser}
          onSave={handleSaveUser}
          onCancel={() => {
            setShowAddForm(false);
            setEditingUser(null);
          }}
        />
      )}

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.map(user => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-[#1e1e77] text-white flex items-center justify-center">
                        <FontAwesomeIcon icon={faUser} className="text-xl" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.department}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize
                    ${user.status === 'active' ? 'bg-green-100 text-green-800' : 
                      user.status === 'inactive' ? 'bg-gray-100 text-gray-800' : 
                      'bg-red-100 text-red-800'}`}>
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.lastLogin}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => setEditingUser(user)}
                    className="text-blue-600 hover:text-blue-900 mx-2"
                    title="Edit User"
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                  <button
                    onClick={() => handleResetPassword(user.id)}
                    className="text-yellow-600 hover:text-yellow-900 mx-2"
                    title="Reset Password"
                  >
                    <FontAwesomeIcon icon={faKey} />
                  </button>
                  <button
                    onClick={() => handleToggleStatus(user.id)}
                    className={`${user.status === 'active' ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'} mx-2`}
                    title={`${user.status === 'active' ? 'Deactivate' : 'Activate'} User`}
                  >
                    <FontAwesomeIcon icon={user.status === 'active' ? faToggleOn : faToggleOff} />
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    className="text-red-600 hover:text-red-900 mx-2"
                    title="Delete User"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const UserForm = ({ user, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    role: user?.role || 'student',
    college: user?.college || '',
    department: user?.department || '',
    status: user?.status || 'active'
  });

  const roles = ['student', 'lecturer', 'dean', 'admin'];
  
  const collegesAndDepartments = {
    'College of Engineering': [
      'Computer Engineering',
      'Electrical Engineering',
      'Mechanical Engineering',
      'Civil Engineering',
      'Software Engineering'
    ],
    'College of Computing and IT': [
      'Computer Science',
      'Information Technology',
      'Information Systems',
      'Software Engineering'
    ],
    'College of Natural Sciences': [
      'Physics',
      'Chemistry',
      'Mathematics',
      'Biology'
    ],
    'College of Business': [
      'Business Administration',
      'Economics',
      'Finance',
      'Accounting'
    ],
    'College of Humanities': [
      'Literature',
      'Languages',
      'Philosophy',
      'History'
    ]
  };

  const handleCollegeChange = (e) => {
    const selectedCollege = e.target.value;
    setFormData({
      ...formData,
      college: selectedCollege,
      department: '' // Reset department when college changes
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        {user ? 'Edit User' : 'Add New User'}
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Enter full name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Enter email address"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg capitalize"
            >
              {roles.map(role => (
                <option key={role} value={role} className="capitalize">
                  {role}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">College</label>
            <select
              value={formData.college}
              onChange={handleCollegeChange}
              className="w-full px-3 py-2 border rounded-lg"
              required
            >
              <option value="">Select College</option>
              {Object.keys(collegesAndDepartments).map(college => (
                <option key={college} value={college}>
                  {college}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <select
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              required
              disabled={!formData.college}
            >
              <option value="">Select Department</option>
              {formData.college && collegesAndDepartments[formData.college].map(dept => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
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

export default UserManagement; 