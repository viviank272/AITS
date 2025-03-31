import { useState, useEffect } from 'react';
import {
  UserGroupIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

function RoleManagement() {
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState([
    {
      id: 1,
      name: 'Administrator',
      description: 'Full system access with all permissions',
      permissions: ['manage_users', 'manage_roles', 'manage_settings', 'view_reports'],
      userCount: 3
    },
    {
      id: 2,
      name: 'Lecturer',
      description: 'Access to manage student issues and view reports',
      permissions: ['manage_issues', 'view_reports', 'manage_students'],
      userCount: 25
    },
    {
      id: 3,
      name: 'Student',
      description: 'Basic access to create and track issues',
      permissions: ['create_issues', 'view_own_issues', 'update_profile'],
      userCount: 150
    }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: []
  });

  const availablePermissions = [
    { id: 'manage_users', name: 'Manage Users' },
    { id: 'manage_roles', name: 'Manage Roles' },
    { id: 'manage_settings', name: 'Manage Settings' },
    { id: 'view_reports', name: 'View Reports' },
    { id: 'manage_issues', name: 'Manage Issues' },
    { id: 'manage_students', name: 'Manage Students' },
    { id: 'create_issues', name: 'Create Issues' },
    { id: 'view_own_issues', name: 'View Own Issues' },
    { id: 'update_profile', name: 'Update Profile' }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
    setLoading(false);
    }, 1000);
  }, []);

  const handleOpenModal = (role = null) => {
    if (role) {
      setEditingRole(role);
      setFormData({
        name: role.name,
        description: role.description,
        permissions: role.permissions
      });
    } else {
      setEditingRole(null);
      setFormData({
        name: '',
        description: '',
        permissions: []
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingRole(null);
    setFormData({
      name: '',
      description: '',
      permissions: []
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingRole) {
      // Update existing role
      setRoles(roles.map(role =>
        role.id === editingRole.id
          ? { ...role, ...formData }
          : role
      ));
    } else {
      // Add new role
      setRoles([
        ...roles,
        {
          id: roles.length + 1,
          ...formData,
          userCount: 0
        }
      ]);
    }
    handleCloseModal();
  };

  const handleDeleteRole = (roleId) => {
    if (window.confirm('Are you sure you want to delete this role?')) {
      setRoles(roles.filter(role => role.id !== roleId));
    }
  };

  const togglePermission = (permissionId) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(id => id !== permissionId)
        : [...prev.permissions, permissionId]
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <UserGroupIcon className="h-6 w-6 text-gray-400 mr-2" />
            <h1 className="text-2xl font-semibold text-gray-900">Roles & Permissions</h1>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Role
          </button>
        </div>

        <div className="mt-8">
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {roles.map(role => (
                <li key={role.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-medium text-gray-900 truncate">
                          {role.name}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          {role.description}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {role.permissions.map(permission => (
                              <span
                                key={permission}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                              >
                              {permission.replace(/_/g, ' ')}
                              </span>
                            ))}
                          </div>
                        <div className="mt-2 text-sm text-gray-500">
                          {role.userCount} users assigned
                        </div>
                      </div>
                      <div className="ml-4 flex-shrink-0 flex space-x-2">
                            <button
                          onClick={() => handleOpenModal(role)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                          <PencilIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleDeleteRole(role.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Role Modal */}
        {showModal && (
          <div className="fixed z-10 inset-0 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>

              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <form onSubmit={handleSubmit}>
                  <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <div className="sm:flex sm:items-start">
                      <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                          {editingRole ? 'Edit Role' : 'Add New Role'}
                        </h3>
                        <div className="mt-4 space-y-4">
                          <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                              Role Name
                            </label>
                            <input
                              type="text"
                              id="name"
                              value={formData.name}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                              required
                            />
                          </div>
                          <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                              Description
                            </label>
                            <textarea
                              id="description"
                              rows={3}
                              value={formData.description}
                              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Permissions
                            </label>
                            <div className="space-y-2">
                              {availablePermissions.map(permission => (
                                <div key={permission.id} className="flex items-center">
                                  <input
                                    type="checkbox"
                                    id={permission.id}
                                    checked={formData.permissions.includes(permission.id)}
                                    onChange={() => togglePermission(permission.id)}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                  />
                                  <label htmlFor={permission.id} className="ml-2 block text-sm text-gray-900">
                                    {permission.name}
                                  </label>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                    <button
                      type="submit"
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      {editingRole ? 'Update Role' : 'Create Role'}
                    </button>
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default RoleManagement; 