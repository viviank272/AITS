import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTimes,
  faSpinner,
} from '@fortawesome/free-solid-svg-icons';
import { getColleges, getDepartmentsByCollege, createProgram, updateProgram } from '../../services/api';
import { toast } from 'react-toastify';

const AddProgramDialog = ({ program, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    program_name: '',
    code: '',  // Changed from program_code to match backend
    college: '',
    college_id: null, // Added to store numeric ID for backend
    department: '',
    department_id: null, // Added to store numeric ID for backend
    duration: '3 years',
    program_head: null, // Changed to null to match backend expectation
    is_active: true
  });

  const [colleges, setColleges] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [apiConnectionError, setApiConnectionError] = useState(false);

  const durations = ['1 year', '2 years', '3 years', '4 years', '5 years'];

  // Fetch colleges on component mount
  useEffect(() => {
    const fetchColleges = async () => {
      try {
        setLoading(true);
        setError(null);
        setApiConnectionError(false);
        
        // Debug authentication information
        const token = localStorage.getItem('access');
        console.log('Authentication token:', token ? `${token.substring(0, 10)}...` : 'No token found');
        console.log('User role:', localStorage.getItem('selectedRole'));
        
        console.log('Fetching colleges from endpoint: /academic/colleges/');
        const data = await getColleges();
        console.log('Colleges data received:', data);
        
        if (!Array.isArray(data)) {
          console.error('Invalid colleges data format received:', typeof data, data);
          throw new Error('Invalid colleges data format received');
        }
        
        console.log(`Successfully loaded ${data.length} colleges`);
        setColleges(data);
      } catch (err) {
        console.error('Error fetching colleges:', err);
        console.error('Error stack:', err.stack);
        console.error('Error details:', err.response?.data || err.message);
        
        if (err.response) {
          console.error('Error status:', err.response.status);
          console.error('Error headers:', err.response.headers);
        } else {
          // Network error or server not responding
          setApiConnectionError(true);
        }
        
        setError('Failed to fetch colleges. Please try again.');
        // Add a toast notification for better user feedback
        toast.error('Failed to load colleges. Check your connection and try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchColleges();
  }, []);

  // Fetch departments when college changes
  useEffect(() => {
    const fetchDepartments = async () => {
      if (!formData.college_id) {
        setDepartments([]);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        // Debug authentication information
        const token = localStorage.getItem('access');
        console.log('Authentication token for departments:', token ? `${token.substring(0, 10)}...` : 'No token found');
        
        console.log(`Fetching departments for college ID: ${formData.college_id} from endpoint: /academic/colleges/${formData.college_id}/departments/`);
        const data = await getDepartmentsByCollege(formData.college_id);
        console.log('Departments data received:', data);
        
        if (!Array.isArray(data)) {
          console.error('Invalid departments data format received:', typeof data, data);
          throw new Error('Invalid departments data format received');
        }
        
        console.log(`Successfully loaded ${data.length} departments for college ${formData.college_id}`);
        setDepartments(data);
      } catch (err) {
        console.error('Error fetching departments:', err);
        console.error('Error stack:', err.stack);
        console.error('Error details:', err.response?.data || err.message);
        
        if (err.response) {
          console.error('Error status:', err.response.status);
          console.error('Error headers:', err.response.headers);
        }
        
        setError('Failed to fetch departments. Please try again.');
        setDepartments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDepartments();
  }, [formData.college_id]);

  // Set initial form data if editing
  useEffect(() => {
    if (program) {
      console.log('Setting up form for editing program:', program);
      
      // Find the corresponding college object
      const college = colleges.find(c => 
        c.college_id === program.college || 
        c.college_name === program.college_name
      );
      
      setFormData({
        program_name: program.program_name || program.name || '',
        code: program.code || '',
        college: college?.college_name || program.college_name || '',
        college_id: college?.college_id || program.college || null,
        department: program.department_name || program.department || '',
        department_id: program.department_id || program.department || null,
        duration: program.duration || '3 years',
        program_head: program.program_head || null,
        is_active: program.is_active ?? true
      });
    }
  }, [program, colleges]);

  const handleCollegeChange = (e) => {
    const collegeId = e.target.value;
    
    if (!collegeId) {
      setFormData(prev => ({
        ...prev,
        college: '',
        college_id: null,
        department: '',
        department_id: null
      }));
      return;
    }
    
    // Find selected college object
    const selectedCollege = colleges.find(c => c.college_id.toString() === collegeId);
    
    if (selectedCollege) {
      console.log('Selected college:', selectedCollege);
      setFormData(prev => ({
        ...prev,
        college: selectedCollege.college_name,
        college_id: selectedCollege.college_id,
        department: '',
        department_id: null
      }));
    }
  };

  const handleDepartmentChange = (e) => {
    const departmentId = e.target.value;
    
    if (!departmentId) {
      setFormData(prev => ({
        ...prev,
        department: '',
        department_id: null
      }));
      return;
    }
    
    // Find selected department object
    const selectedDepartment = departments.find(d => d.department_id.toString() === departmentId);
    
    if (selectedDepartment) {
      console.log('Selected department:', selectedDepartment);
      setFormData(prev => ({
        ...prev,
        department: selectedDepartment.dept_name,
        department_id: selectedDepartment.department_id
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    console.log(`Field ${name} changed to:`, type === 'checkbox' ? checked : value);
    
    // Clear validation error when field is edited
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const prepareDataForSubmission = () => {
    // Prepare the data object for API submission
    return {
      program_name: formData.program_name,
      code: formData.code,
      college: formData.college_id,
      department: formData.department_id,
      is_active: formData.is_active
    };
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.program_name.trim()) {
      errors.program_name = 'Program name is required';
    }
    
    if (!formData.code.trim()) {
      errors.code = 'Program code is required';
    }
    
    if (!formData.college_id) {
      errors.college = 'College is required';
    }
    
    if (!formData.department_id) {
      errors.department = 'Department is required';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setSubmitLoading(true);
      setError(null);
      
      const dataToSubmit = prepareDataForSubmission();
      console.log('Submitting program data:', dataToSubmit);
      
      let response;
      if (program?.id || program?.program_id) {
        const programId = program.id || program.program_id;
        response = await updateProgram(programId, dataToSubmit);
        toast.success('Program updated successfully');
      } else {
        response = await createProgram(dataToSubmit);
        toast.success('Program created successfully');
      }
      
      // Call the parent onSave callback with the response from the API
      onSave(response);
      onClose();
    } catch (err) {
      console.error('Error saving program:', err);
      
      // Handle validation errors from the backend
      if (err.response?.data && typeof err.response.data === 'object') {
        const backendErrors = err.response.data;
        const formattedErrors = {};
        
        // Map backend errors to form fields
        Object.entries(backendErrors).forEach(([field, messages]) => {
          if (Array.isArray(messages) && messages.length > 0) {
            formattedErrors[field] = messages[0];
          } else if (typeof messages === 'string') {
            formattedErrors[field] = messages;
          }
        });
        
        setValidationErrors(formattedErrors);
        setError('Please correct the errors below.');
      } else {
        setError(err.message || 'Failed to save program. Please try again.');
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  // Helper function to check if a field has an error
  const hasError = (fieldName) => Boolean(validationErrors[fieldName]);
  
  // Helper function to get error message for a field
  const getErrorMessage = (fieldName) => validationErrors[fieldName];

  if (apiConnectionError) {
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
          <div className="mb-4 text-center">
            <FontAwesomeIcon icon={faSpinner} className="text-red-500 h-16 w-16 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">Connection Error</h3>
            <p className="text-sm text-gray-500 mt-2">
              Unable to connect to the server. Please check your internet connection and try again.
            </p>
          </div>
          <div className="flex justify-center">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {program ? 'Edit Program' : 'Add New Program'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <FontAwesomeIcon icon={faTimes} className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-2 bg-red-50 text-red-500 text-sm rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Program Name</label>
            <input
              type="text"
              name="program_name"
              value={formData.program_name}
              onChange={handleChange}
              className={`mt-1 block w-full px-3 py-2 border ${hasError('program_name') ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
            />
            {hasError('program_name') && (
              <p className="mt-1 text-sm text-red-600">{getErrorMessage('program_name')}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Program Code</label>
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleChange}
              className={`mt-1 block w-full px-3 py-2 border ${hasError('code') ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
            />
            {hasError('code') && (
              <p className="mt-1 text-sm text-red-600">{getErrorMessage('code')}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">College</label>
            <select
              name="college"
              value={formData.college_id || ''}
              onChange={handleCollegeChange}
              disabled={loading}
              className={`mt-1 block w-full px-3 py-2 border ${hasError('college') ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
            >
              <option value="">Select a college</option>
              {colleges.map(college => (
                <option key={college.college_id} value={college.college_id}>
                  {college.college_name}
                </option>
              ))}
            </select>
            {hasError('college') && (
              <p className="mt-1 text-sm text-red-600">{getErrorMessage('college')}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Department</label>
            <select
              name="department"
              value={formData.department_id || ''}
              onChange={handleDepartmentChange}
              disabled={!formData.college_id || loading}
              className={`mt-1 block w-full px-3 py-2 border ${hasError('department') ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
            >
              <option value="">
                {loading ? 'Loading departments...' : 'Select a department'}
              </option>
              {departments.map(dept => (
                <option key={dept.department_id} value={dept.department_id}>
                  {dept.dept_name}
                </option>
              ))}
            </select>
            {hasError('department') && (
              <p className="mt-1 text-sm text-red-600">{getErrorMessage('department')}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Duration</label>
            <select
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              {durations.map(duration => (
                <option key={duration} value={duration}>
                  {duration}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-900">
              Active Program
            </label>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="mr-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={submitLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || submitLoading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center"
            >
              {submitLoading && <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />}
              {program ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProgramDialog; 