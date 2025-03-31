import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faEdit,
  faTrash,
  faToggleOn,
  faToggleOff,
  faSearch,
  faUserShield,
  faUserTie,
  faUserGraduate,
  faCheck,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import '../../utils/fontawesome';

const Roles = () => {
  const [roles, setRoles] = useState([
    {
      id: 1,
      name: 'Administrator',
      description: 'Full system access with all permissions',
      permissions: {
        users: { view: true, create: true, edit: true, delete: true },
        colleges: { view: true, create: true, edit: true, delete: true },
        programs: { view: true, create: true, edit: true, delete: true },
        students: { view: true, create: true, edit: true, delete: true },
        issues: { view: true, create: true, edit: true, delete: true },
        categories: { view: true, create: true, edit: true, delete: true },
        reports: { view: true, create: true, edit: true, delete: true },
        settings: { view: true, create: true, edit: true, delete: true },
        roles: { view: true, create: true, edit: true, delete: true },
        auditLogs: { view: true, create: true, edit: true, delete: true }
      },
      status: 'active',
      userCount: 5
    },
    {
      id: 2,
      name: 'Lecturer',
      description: 'Access to assigned issues and department management',
      permissions: {
        users: { view: false, create: false, edit: false, delete: false },
        colleges: { view: true, create: false, edit: false, delete: false },
        programs: { view: true, create: false, edit: false, delete: false },
        students: { view: true, create: false, edit: false, delete: false },
        issues: { view: true, create: true, edit: true, delete: false },
        categories: { view: true, create: false, edit: false, delete: false },
        reports: { view: true, create: false, edit: false, delete: false },
        settings: { view: false, create: false, edit: false, delete: false },
        roles: { view: false, create: false, edit: false, delete: false },
        auditLogs: { view: false, create: false, edit: false, delete: false }
      },
      status: 'active',
      userCount: 25
    },
    {
      id: 3,
      name: 'Student',
      description: 'Basic access to create and view own issues',
      permissions: {
        users: { view: false, create: false, edit: false, delete: false },
        colleges: { view: true, create: false, edit: false, delete: false },
        programs: { view: true, create: false, edit: false, delete: false },
        students: { view: false, create: false, edit: false, delete: false },
        issues: { view: true, create: true, edit: false, delete: false },
        categories: { view: true, create: false, edit: false, delete: false },
        reports: { view: false, create: false, edit: false, delete: false },
        settings: { view: false, create: false, edit: false, delete: false },
        roles: { view: false, create: false, edit: false, delete: false },
        auditLogs: { view: false, create: false, edit: false, delete: false }
      },
      status: 'active',
      userCount: 150
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [editingPermissions, setEditingPermissions] = useState({});

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleAddRole = () => {
    setEditingRole(null);
    setEditingPermissions({
      users: { view: false, create: false, edit: false, delete: false },
      colleges: { view: false, create: false, edit: false, delete: false },
      programs: { view: false, create: false, edit: false, delete: false },
      students: { view: false, create: false, edit: false, delete: false },
      issues: { view: false, create: false, edit: false, delete: false },
      categories: { view: false, create: false, edit: false, delete: false },
      reports: { view: false, create: false, edit: false, delete: false },
      settings: { view: false, create: false, edit: false, delete: false },
      roles: { view: false, create: false, edit: false, delete: false },
      auditLogs: { view: false, create: false, edit: false, delete: false }
    });
    setShowForm(true);
  };

  const handleEditRole = (role) => {
    setEditingRole(role);
    setEditingPermissions(role.permissions);
    setShowForm(true);
  };

  const handleDeleteRole = (id) => {
    if (window.confirm('Are you sure you want to delete this role?')) {
      setRoles(roles.filter(role => role.id !== id));
    }
  };

  const handleToggleStatus = (id) => {
    setRoles(roles.map(role =>
      role.id === id
        ? { ...role, status: role.status === 'active' ? 'inactive' : 'active' }
        : role
    ));
  };

  const handlePermissionChange = (module, action) => {
    setEditingPermissions(prev => ({
      ...prev,
      [module]: {
        ...prev[module],
        [action]: !prev[module][action]
      }
    }));
  };

  const handleSaveRole = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const roleData = {
      id: editingRole?.id || roles.length + 1,
      name: formData.get('name'),
      description: formData.get('name'), // Using name as description for simplicity
      permissions: editingPermissions,
      status: formData.get('status'),
      userCount: editingRole?.userCount || 0
    };

    if (editingRole) {
      setRoles(roles.map(role =>
        role.id === editingRole.id ? roleData : role
      ));
    } else {
      setRoles([...roles, roleData]);
    }

    setShowForm(false);
    setEditingRole(null);
  };

  const filteredRoles = roles.filter(role => {
    const matchesSearch = 
      role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || role.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getRoleIcon = (name) => {
    switch (name.toLowerCase()) {
      case 'administrator':
        return faUserShield;
      case 'lecturer':
        return faUserTie;
      case 'student':
        return faUserGraduate;
      default:
        return faUserShield;
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-[#1e1e77]">Roles</h1>
        <button
          onClick={handleAddRole}
          className="flex items-center gap-2 px-4 py-2 bg-[#1e1e77] text-white rounded-lg hover:bg-[#2a2a8f]"
        >
          <FontAwesomeIcon icon={faPlus} />
          Add Role
        </button>
      </div>

      {/* Search and Filter */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search roles..."
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
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Role Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-[95%] max-w-6xl">
            <h2 className="text-xl font-semibold mb-4">
              {editingRole ? 'Edit Role' : 'Add New Role'}
            </h2>
            <form onSubmit={handleSaveRole}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                      type="text"
                      name="name"
                      defaultValue={editingRole?.name}
                      className="mt-1 block w-full border rounded-lg px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <select
                      name="status"
                      defaultValue={editingRole?.status || 'active'}
                      className="mt-1 block w-full border rounded-lg px-3 py-2"
                      required
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                {/* Permissions Grid */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
                  <div className="grid grid-cols-5 gap-3">
                    {Object.entries(editingPermissions).map(([module, permissions]) => (
                      <div key={module} className="border rounded-lg p-3">
                        <h3 className="font-medium capitalize mb-2 text-sm">{module}</h3>
                        <div className="space-y-1.5">
                          {Object.entries(permissions).map(([action, enabled]) => (
                            <label key={action} className="flex items-center">
                              <input
                                type="checkbox"
                                checked={enabled}
                                onChange={() => handlePermissionChange(module, action)}
                                className="rounded border-gray-300 text-[#1e1e77] focus:ring-[#1e1e77]"
                              />
                              <span className="ml-2 text-sm capitalize">{action}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingRole(null);
                  }}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1e1e77] text-white rounded-lg hover:bg-[#2a2a8f]"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRoles.map(role => (
          <div
            key={role.id}
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-purple-100 text-purple-800">
                  <FontAwesomeIcon icon={getRoleIcon(role.name)} className="text-xl" />
                </div>
                <h3 className="text-lg font-semibold ml-3">{role.name}</h3>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEditRole(role)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FontAwesomeIcon icon={faEdit} />
                </button>
                <button
                  onClick={() => handleDeleteRole(role.id)}
                  className="text-gray-400 hover:text-red-600"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
                <button
                  onClick={() => handleToggleStatus(role.id)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FontAwesomeIcon
                    icon={role.status === 'active' ? faToggleOn : faToggleOff}
                    className={role.status === 'active' ? 'text-green-500' : 'text-gray-400'}
                  />
                </button>
              </div>
            </div>

            {/* Permissions Grid */}
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(role.permissions).map(([module, perms]) => (
                <div key={module} className="text-sm">
                  <div className="font-medium capitalize">{module}</div>
                  <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                    {Object.entries(perms).map(([action, enabled]) => (
                      <span key={action} className="flex items-center">
                        <FontAwesomeIcon
                          icon={enabled ? faCheck : faTimes}
                          className={enabled ? 'text-green-500' : 'text-gray-400'}
                        />
                        <span className="ml-1 capitalize">{action}</span>
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between mt-4">
              <span className="text-sm text-gray-500">
                {role.userCount} users
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                role.status === 'active'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {role.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Roles; 