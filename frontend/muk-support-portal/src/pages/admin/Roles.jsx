import React, { useState, useEffect } from 'react';
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
  faTimes,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import { getRoles, createRole, updateRole, deleteRole } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import '../../utils/fontawesome';

const Roles = () => {
  const navigate = useNavigate();
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [editingPermissions, setEditingPermissions] = useState({});

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const data = await getRoles();
      
      // Ensure permissions are correctly structured
      const rolesWithFormattedPermissions = data.map(role => {
        // If permissions is a string, try to parse it
        let permissions = role.permissions;
        if (typeof permissions === 'string') {
          try {
            permissions = JSON.parse(permissions);
          } catch (error) {
            console.error('Error parsing permissions:', error);
            permissions = {};
          }
        }
        
        // Ensure all required permission modules exist
        const defaultPermissions = {
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
        };
        
        // Merge existing permissions with default structure
        for (const [key, value] of Object.entries(permissions)) {
          if (defaultPermissions[key]) {
            defaultPermissions[key] = { ...defaultPermissions[key], ...value };
          }
        }
        
        return {
          ...role,
          permissions: defaultPermissions,
          status: role.is_active !== undefined ? (role.is_active ? 'active' : 'inactive') : 'active'
        };
      });
      
      setRoles(rolesWithFormattedPermissions);
      setError(null);
    } catch (err) {
      console.error('Error fetching roles:', err);
      setError('Failed to load roles. Please try again.');
      
      // Handle unauthorized error
      if (err.message === 'Unauthorized') {
        navigate('/login', { state: { from: '/admin/roles' } });
      }
    } finally {
      setLoading(false);
    }
  };

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

  const handleDeleteRole = async (id) => {
    if (window.confirm('Are you sure you want to delete this role?')) {
      try {
        await deleteRole(id);
        setRoles(roles.filter(role => role.role_id !== id));
      } catch (err) {
        console.error('Error deleting role:', err);
        if (err.response?.data?.error) {
          alert(`Error: ${err.response.data.error}`);
        } else {
          alert(`Error: ${err.message || 'Failed to delete role'}`);
        }
      }
    }
  };

  const handleToggleStatus = async (role) => {
    try {
      const updatedRole = await updateRole(role.role_id, {
        ...role,
        is_active: role.status === 'active' ? false : true,
        permissions: role.permissions
      });
      
      setRoles(roles.map(r =>
        r.role_id === role.role_id ? {
          ...updatedRole,
          status: updatedRole.is_active ? 'active' : 'inactive',
          permissions: role.permissions // Preserve formatted permissions
        } : r
      ));
    } catch (err) {
      console.error('Error updating role status:', err);
      alert(`Error updating role status: ${err.message || 'Unknown error'}`);
    }
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

  const handleSaveRole = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const roleData = {
      role_name: formData.get('name'),
      description: formData.get('description') || formData.get('name'), // Fallback to name if description is empty
      permissions: editingPermissions,
      is_active: formData.get('status') === 'active'
    };

    try {
      if (editingRole) {
        // Update existing role
        const updatedRole = await updateRole(editingRole.role_id, roleData);
        setRoles(roles.map(role =>
          role.role_id === editingRole.role_id ? {
            ...updatedRole,
            status: updatedRole.is_active ? 'active' : 'inactive',
            permissions: editingPermissions // Use our formatted permissions
          } : role
        ));
      } else {
        // Create new role
        const newRole = await createRole(roleData);
        setRoles([...roles, {
          ...newRole,
          status: newRole.is_active ? 'active' : 'inactive',
          permissions: editingPermissions
        }]);
      }
      
      setShowForm(false);
      setEditingRole(null);
    } catch (err) {
      console.error('Error saving role:', err);
      alert(`Error saving role: ${err.message || 'Unknown error'}`);
    }
  };

  const filteredRoles = roles.filter(role => {
    const matchesSearch = 
      role.role_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || role.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getRoleIcon = (name) => {
    const lowerName = name?.toLowerCase() || '';
    if (lowerName.includes('admin')) {
      return faUserShield;
    } else if (lowerName.includes('lecturer') || lowerName.includes('staff')) {
      return faUserTie;
    } else if (lowerName.includes('student')) {
      return faUserGraduate;
    } else {
      return faUserShield;
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <div className="flex items-center">
            <FontAwesomeIcon icon={faExclamationTriangle} className="text-xl mr-2" />
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline ml-2"> {error}</span>
          </div>
          <button 
            className="mt-4 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            onClick={fetchRoles}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

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

      {/* Role Cards */}
      {filteredRoles.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-lg">
          <p className="text-gray-500 mb-2">No roles found</p>
          <button 
            onClick={handleAddRole}
            className="px-4 py-2 bg-[#1e1e77] text-white rounded-lg"
          >
            Create your first role
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRoles.map((role) => (
            <div
              key={role.role_id}
              className="bg-white p-6 rounded-lg shadow-md border border-gray-200"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center">
                  <div className="bg-[#eaeafc] p-3 rounded-full mr-3">
                    <FontAwesomeIcon
                      icon={getRoleIcon(role.role_name)}
                      className="text-[#1e1e77]"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{role.role_name}</h3>
                    <p className="text-sm text-gray-500">{role.description}</p>
                  </div>
                </div>
                <div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    role.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {role.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-500 mb-1">
                  <span>Users</span>
                  <span>{role.user_count || 0}</span>
                </div>
                <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#1e1e77] h-2"
                    style={{ width: `${Math.min(100, (role.user_count || 0) / 2)}%` }}
                  ></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-4">
                {Object.entries(role.permissions).slice(0, 4).map(([module, perms]) => (
                  <div key={module} className="bg-gray-50 p-2 rounded text-sm">
                    <span className="font-medium capitalize">{module}</span>
                    <div className="flex items-center mt-1">
                      <FontAwesomeIcon
                        icon={perms.view ? faCheck : faTimes}
                        className={`w-3 h-3 ${perms.view ? 'text-green-500' : 'text-red-500'}`}
                      />
                      <span className="ml-1 text-xs text-gray-500">View</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => handleToggleStatus(role)}
                  className={`p-2 rounded-md ${
                    role.status === 'active'
                      ? 'text-green-600 hover:bg-green-50'
                      : 'text-red-600 hover:bg-red-50'
                  }`}
                >
                  <FontAwesomeIcon
                    icon={role.status === 'active' ? faToggleOn : faToggleOff}
                    className="text-xl"
                  />
                </button>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditRole(role)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                  <button
                    onClick={() => handleDeleteRole(role.role_id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Role Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
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
                      defaultValue={editingRole?.role_name}
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

                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    name="description"
                    defaultValue={editingRole?.description}
                    className="mt-1 block w-full border rounded-lg px-3 py-2"
                    rows="2"
                  ></textarea>
                </div>

                <div>
                  <h3 className="text-md font-medium text-gray-700 mb-2">Permissions</h3>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Module
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            View
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Create
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Edit
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Delete
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {Object.entries(editingPermissions).map(([module, permissions]) => (
                          <tr key={module}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 capitalize">
                              {module}
                            </td>
                            {['view', 'create', 'edit', 'delete'].map((action) => (
                              <td key={action} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <div className="flex items-center">
                                  <input
                                    type="checkbox"
                                    checked={permissions[action]}
                                    onChange={() => handlePermissionChange(module, action)}
                                    className="h-4 w-4 text-[#1e1e77] focus:ring-[#1e1e77] border-gray-300 rounded"
                                  />
                                </div>
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1e1e77] text-white rounded-lg hover:bg-[#2a2a8f]"
                >
                  {editingRole ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Roles; 