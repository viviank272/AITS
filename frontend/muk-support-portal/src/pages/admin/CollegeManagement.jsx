import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faEdit,
  faTrash,
  faChevronDown,
  faChevronRight,
  faSearch,
  faBuilding,
  faSave,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import { getColleges, getDepartments, createCollege, updateCollege, deleteCollege, createDepartment, updateDepartment, deleteDepartment } from '../../services/api';

const CollegeManagement = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const topRef = useRef(null);
  const [colleges, setColleges] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [expandedColleges, setExpandedColleges] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [editingCollege, setEditingCollege] = useState(null);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [showNewCollegeForm, setShowNewCollegeForm] = useState(false);
  const [showNewDepartmentForm, setShowNewDepartmentForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [collegeToDelete, setCollegeToDelete] = useState(null);
  const [showDeleteDepartmentConfirm, setShowDeleteDepartmentConfirm] = useState(false);
  const [departmentToDelete, setDepartmentToDelete] = useState(null);

  // Check if user is authenticated
  useEffect(() => {
    const token = localStorage.getItem('access');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  // Update the scrollToTop function to use ref
  const scrollToTop = () => {
    if (topRef.current) {
      topRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Fetch colleges and departments
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [collegesData, departmentsData] = await Promise.all([
          getColleges(),
          getDepartments()
        ]);
        setColleges(collegesData);
        setDepartments(departmentsData);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load colleges and departments. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Check URL parameters for actions
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const action = searchParams.get('action');
    
    if (action === 'add') {
      if (colleges.length > 0) {
        setExpandedColleges({ [colleges[0].college_id]: true });
        setShowNewDepartmentForm(colleges[0].college_id);
      } else {
        setShowNewCollegeForm(true);
      }
    }
  }, [location, colleges]);

  const toggleCollege = (collegeId) => {
    setExpandedColleges(prev => ({
      ...prev,
      [collegeId]: !prev[collegeId]
    }));
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredColleges = colleges.filter(college => 
    college.college_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    departments.some(dept => 
      dept.college === college.college_id && 
      dept.dept_name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleAddCollege = () => {
    setShowNewCollegeForm(true);
  };

  const handleAddDepartment = (collegeId) => {
    setShowNewDepartmentForm(collegeId);
  };

  const handleSaveCollege = async (collegeData) => {
    try {
    if (editingCollege) {
        const updatedCollege = await updateCollege(editingCollege.college_id, collegeData);
      setColleges(colleges.map(c => 
          c.college_id === editingCollege.college_id ? updatedCollege : c
      ));
      setEditingCollege(null);
        setSuccessMessage('College updated successfully');
    } else {
        const newCollege = await createCollege(collegeData);
        setColleges([...colleges, newCollege]);
      setShowNewCollegeForm(false);
        setSuccessMessage('College added successfully');
      }
      // Clear any existing errors
      setError('');
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
      // Scroll to top immediately
      scrollToTop();
    } catch (err) {
      console.error('Error saving college:', err);
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.detail || 
                          'Failed to save college. Please try again.';
      setError(errorMessage);
      throw err;
    }
  };

  const handleSaveDepartment = async (collegeId, departmentData) => {
    try {
    if (editingDepartment) {
        const updatedDepartment = await updateDepartment(editingDepartment.department_id, {
          ...departmentData,
          college: editingDepartment.college
        });
        setDepartments(departments.map(d => 
          d.department_id === editingDepartment.department_id ? updatedDepartment : d
      ));
      setEditingDepartment(null);
        setSuccessMessage('Department updated successfully');
    } else {
        const newDepartment = await createDepartment({
          ...departmentData,
          college: collegeId
        });
        setDepartments([...departments, newDepartment]);
      setShowNewDepartmentForm(null);
        setSuccessMessage('Department added successfully');
      }
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
      // Scroll to top immediately
      scrollToTop();
    } catch (err) {
      console.error('Error saving department:', err);
      
      // Handle unauthorized error
      if (err.message === 'Unauthorized') {
        setError('Your session has expired. Please log in again.');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError('Failed to save department. Please try again.');
      }
    }
  };

  const handleDeleteCollege = async (collegeId) => {
    setCollegeToDelete(collegeId);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteCollege = async () => {
    try {
      await deleteCollege(collegeToDelete);
      setColleges(colleges.filter(c => c.college_id !== collegeToDelete));
      setDepartments(departments.filter(d => d.college !== collegeToDelete));
      setSuccessMessage('College deleted successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
      // Scroll to top immediately
      scrollToTop();
    } catch (err) {
      console.error('Error deleting college:', err);
      setError('Failed to delete college. Please try again.');
    } finally {
      setShowDeleteConfirm(false);
      setCollegeToDelete(null);
    }
  };

  const handleDeleteDepartment = async (departmentId) => {
    setDepartmentToDelete(departmentId);
    setShowDeleteDepartmentConfirm(true);
  };

  const confirmDeleteDepartment = async () => {
    try {
      await deleteDepartment(departmentToDelete);
      setDepartments(departments.filter(d => d.department_id !== departmentToDelete));
      setSuccessMessage('Department deleted successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
      // Scroll to top immediately
      scrollToTop();
    } catch (err) {
      console.error('Error deleting department:', err);
      setError('Failed to delete department. Please try again.');
    } finally {
      setShowDeleteDepartmentConfirm(false);
      setDepartmentToDelete(null);
    }
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
      {/* Add ref to the top element */}
      <div ref={topRef} className="absolute top-0 left-0 w-full h-0" />
      
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-[#1e1e77]">Colleges & Departments</h1>
        <button
          onClick={handleAddCollege}
          className="flex items-center gap-2 px-4 py-2 bg-[#1e1e77] text-white rounded-lg hover:bg-[#2a2a8f]"
        >
          <FontAwesomeIcon icon={faPlus} />
          Add College
        </button>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">{successMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search colleges and departments..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
            value={searchTerm}
            onChange={handleSearch}
          />
          <FontAwesomeIcon
            icon={faSearch}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
        </div>
      </div>

      {/* Colleges List */}
      <div className="space-y-4">
        {filteredColleges.map(college => (
          <div key={college.college_id} className="bg-white rounded-lg shadow-sm">
            <div
              className="p-4 flex items-center justify-between cursor-pointer"
              onClick={() => toggleCollege(college.college_id)}
            >
              <div className="flex items-center gap-3">
                <FontAwesomeIcon
                  icon={expandedColleges[college.college_id] ? faChevronDown : faChevronRight}
                  className="text-gray-400"
                />
                <FontAwesomeIcon icon={faBuilding} className="text-[#1e1e77]" />
                <div>
                  <h3 className="font-medium">{college.college_name}</h3>
                  <p className="text-sm text-gray-500">{college.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingCollege(college);
                  }}
                  className="p-2 text-blue-600 hover:text-blue-800"
                >
                  <FontAwesomeIcon icon={faEdit} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteCollege(college.college_id);
                  }}
                  className="p-2 text-red-600 hover:text-red-800"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>
            </div>

            {expandedColleges[college.college_id] && (
              <div className="border-t">
                <div className="p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-medium text-gray-700">Departments</h4>
                    <button
                      onClick={() => handleAddDepartment(college.college_id)}
                      className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                    >
                      <FontAwesomeIcon icon={faPlus} />
                      Add Department
                    </button>
                  </div>

                  {showNewDepartmentForm === college.college_id && (
                    <DepartmentForm
                      onSave={(data) => handleSaveDepartment(college.college_id, data)}
                      onCancel={() => setShowNewDepartmentForm(null)}
                    />
                  )}

                  <div className="space-y-2">
                    {departments
                      .filter(dept => dept.college === college.college_id)
                      .map(department => (
                      <div
                          key={department.department_id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded"
                      >
                        <div>
                            <h5 className="font-medium">{department.dept_name}</h5>
                            {department.head_user_id && (
                              <p className="text-sm text-gray-500">Head: {department.head_user_id.full_name}</p>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEditingDepartment(department)}
                            className="p-1 text-blue-600 hover:text-blue-800"
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </button>
                          <button
                              onClick={() => handleDeleteDepartment(department.department_id)}
                            className="p-1 text-red-600 hover:text-red-800"
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* College Modal */}
      {(showNewCollegeForm || editingCollege) && (
        <CollegeForm
          college={editingCollege}
          onSave={handleSaveCollege}
          onCancel={() => {
            setShowNewCollegeForm(false);
            setEditingCollege(null);
          }}
        />
      )}

      {/* Department Modal */}
      {editingDepartment && (
        <DepartmentForm
          department={editingDepartment}
          onSave={(data) => handleSaveDepartment(
            departments.find(d => d.department_id === editingDepartment.department_id).college,
            data
          )}
          onCancel={() => setEditingDepartment(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Delete College</h3>
              <p className="text-sm text-gray-500 mb-6">
                Are you sure you want to delete this college? This action cannot be undone and will also delete all associated departments.
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setCollegeToDelete(null);
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteCollege}
                className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Department Confirmation Modal */}
      {showDeleteDepartmentConfirm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Delete Department</h3>
              <p className="text-sm text-gray-500 mb-6">
                Are you sure you want to delete this department? This action cannot be undone.
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteDepartmentConfirm(false);
                  setDepartmentToDelete(null);
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteDepartment}
                className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const CollegeForm = ({ college, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    college_name: college?.college_name || '',
    description: college?.description || '',
    campus_location: college?.campus_location || ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validate form data
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.college_name.trim()) {
      newErrors.college_name = 'College name is required';
    } else if (formData.college_name.length < 3) {
      newErrors.college_name = 'College name must be at least 3 characters long';
    }

    if (!formData.campus_location.trim()) {
      newErrors.campus_location = 'Campus location is required';
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description must not exceed 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      await onSave(formData);
    } catch (error) {
      console.error('Error saving college:', error);
      setErrors({
        submit: error.response?.data?.message || 'Failed to save college. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              {college ? 'Edit College' : 'Add New College'}
            </h3>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-500"
              disabled={isSubmitting}
            >
              <FontAwesomeIcon icon={faTimes} className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
        <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                College Name <span className="text-red-500">*</span>
              </label>
          <input
            type="text"
                value={formData.college_name}
                onChange={(e) => {
                  setFormData({ ...formData, college_name: e.target.value });
                  if (errors.college_name) {
                    setErrors({ ...errors, college_name: null });
                  }
                }}
                className={`w-full px-3 py-2 border rounded-lg ${
                  errors.college_name ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'focus:ring-blue-500 focus:border-blue-500'
                }`}
            placeholder="Enter college name"
                disabled={isSubmitting}
              />
              {errors.college_name && (
                <p className="mt-1 text-sm text-red-600">{errors.college_name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => {
                  setFormData({ ...formData, description: e.target.value });
                  if (errors.description) {
                    setErrors({ ...errors, description: null });
                  }
                }}
                className={`w-full px-3 py-2 border rounded-lg ${
                  errors.description ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'focus:ring-blue-500 focus:border-blue-500'
                }`}
                placeholder="Enter college description"
                rows="3"
                disabled={isSubmitting}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
        </div>

        <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Campus Location <span className="text-red-500">*</span>
              </label>
          <input
            type="text"
                value={formData.campus_location}
                onChange={(e) => {
                  setFormData({ ...formData, campus_location: e.target.value });
                  if (errors.campus_location) {
                    setErrors({ ...errors, campus_location: null });
                  }
                }}
                className={`w-full px-3 py-2 border rounded-lg ${
                  errors.campus_location ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'focus:ring-blue-500 focus:border-blue-500'
                }`}
                placeholder="Enter campus location"
                disabled={isSubmitting}
              />
              {errors.campus_location && (
                <p className="mt-1 text-sm text-red-600">{errors.campus_location}</p>
              )}
            </div>

            {errors.submit && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{errors.submit}</p>
        </div>
            )}

            <div className="flex justify-end gap-2 mt-6">
          <button
                type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
                disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
                type="submit"
                className={`px-4 py-2 bg-[#1e1e77] text-white rounded hover:bg-[#2a2a8f] flex items-center gap-2 ${
                  isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
                }`}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faSave} />
                    Save
                  </>
                )}
          </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const DepartmentForm = ({ department, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    dept_name: department?.dept_name || '',
    description: department?.description || ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validate form data
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.dept_name.trim()) {
      newErrors.dept_name = 'Department name is required';
    } else if (formData.dept_name.length < 3) {
      newErrors.dept_name = 'Department name must be at least 3 characters long';
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description must not exceed 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      await onSave(formData);
    } catch (error) {
      console.error('Error saving department:', error);
      setErrors({
        submit: error.response?.data?.message || 'Failed to save department. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              {department ? 'Edit Department' : 'Add New Department'}
            </h3>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-500"
              disabled={isSubmitting}
            >
              <FontAwesomeIcon icon={faTimes} className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
        <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department Name <span className="text-red-500">*</span>
              </label>
          <input
            type="text"
                value={formData.dept_name}
                onChange={(e) => {
                  setFormData({ ...formData, dept_name: e.target.value });
                  if (errors.dept_name) {
                    setErrors({ ...errors, dept_name: null });
                  }
                }}
                className={`w-full px-3 py-2 border rounded-lg ${
                  errors.dept_name ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'focus:ring-blue-500 focus:border-blue-500'
                }`}
            placeholder="Enter department name"
                disabled={isSubmitting}
          />
              {errors.dept_name && (
                <p className="mt-1 text-sm text-red-600">{errors.dept_name}</p>
              )}
        </div>

        <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => {
                  setFormData({ ...formData, description: e.target.value });
                  if (errors.description) {
                    setErrors({ ...errors, description: null });
                  }
                }}
                className={`w-full px-3 py-2 border rounded-lg ${
                  errors.description ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'focus:ring-blue-500 focus:border-blue-500'
                }`}
                placeholder="Enter department description"
                rows="3"
                disabled={isSubmitting}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
            </div>

            {errors.submit && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{errors.submit}</p>
        </div>
            )}

            <div className="flex justify-end gap-2 mt-6">
          <button
                type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
                disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
                type="submit"
                className={`px-4 py-2 bg-[#1e1e77] text-white rounded hover:bg-[#2a2a8f] flex items-center gap-2 ${
                  isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
                }`}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faSave} />
                    Save
                  </>
                )}
          </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CollegeManagement; 