import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

function RoleForm({ role, onSubmit, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: [],
    is_active: true
  });

  // Mock data for available permissions
  const availablePermissions = [
    // User Management
    'manage_users',
    'view_users',
    // Role Management
    'manage_roles',
    'view_roles',
    // Department Management
    'manage_departments',
    'view_departments',
    // College Management
    'manage_colleges',
    'view_colleges',
    // Program Management
    'manage_programs',
    'view_programs',
    // Category Management
    'manage_categories',
    'view_categories',
    // Issue Management
    'create_issues',
    'view_issues',
    'view_own_issues',
    'respond_to_issues',
    'resolve_issues',
    'reopen_issues',
    'assign_issues',
    'comment_on_issues',
    // Report Management
    'view_reports',
    'generate_reports'
  ];

  // Group permissions by category
  const permissionGroups = {
    'User Management': ['manage_users', 'view_users'],
    'Role Management': ['manage_roles', 'view_roles'],
    'Department Management': ['manage_departments', 'view_departments'],
    'College Management': ['manage_colleges', 'view_colleges'],
    'Program Management': ['manage_programs', 'view_programs'],
    'Category Management': ['manage_categories', 'view_categories'],
    'Issue Management': [
      'create_issues',
      'view_issues',
      'view_own_issues',
      'respond_to_issues',
      'resolve_issues',
      'reopen_issues',
      'assign_issues',
      'comment_on_issues'
    ],
    'Report Management': ['view_reports', 'generate_reports']
  };

  useEffect(() => {
    if (role) {
      setFormData({
        name: role.name,
        description: role.description,
        permissions: role.permissions,
        is_active: role.is_active
      });
    }
  }, [role]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      if (name === 'permission') {
        setFormData(prev => ({
          ...prev,
          permissions: checked
            ? [...prev.permissions, value]
            : prev.permissions.filter(p => p !== value)
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: checked
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const formatPermissionName = (permission) => {
    return permission
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              {role ? 'Edit Role' : 'Add New Role'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Role Name
              </label>
              <input
                type="text"
                name="name"
                id="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                name="description"
                id="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Permissions
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(permissionGroups).map(([groupName, permissions]) => (
                  <div key={groupName} className="border rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">{groupName}</h4>
                    <div className="space-y-2">
                      {permissions.map(permission => (
                        <div key={permission} className="flex items-center">
                          <input
                            type="checkbox"
                            id={permission}
                            name="permission"
                            value={permission}
                            checked={formData.permissions.includes(permission)}
                            onChange={handleChange}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor={permission} className="ml-2 block text-sm text-gray-900">
                            {formatPermissionName(permission)}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="is_active"
                id="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                Active Role
              </label>
            </div>

            <div className="mt-5 sm:mt-6">
              <button
                type="submit"
                className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm"
              >
                {role ? 'Update Role' : 'Create Role'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default RoleForm; 