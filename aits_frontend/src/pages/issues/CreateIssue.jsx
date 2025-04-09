import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeftIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { createIssue, uploadFile } from '../../services/api';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const CreateIssue = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading, logout } = useAuth();
  const isStudentView = location.pathname.includes('/student/');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState([]);
  const [priorities, setPriorities] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: '', // Remove default value
    attachments: []
  });

  useEffect(() => {
    // Check if user is authenticated
    if (!loading && !user) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }

    // Fetch categories and priorities from the backend
    const fetchData = async () => {
      try {
        // Fetch categories
        console.log('Fetching categories...');
        const categoriesResponse = await api.get('/issues/categories/');
        console.log('Categories response:', categoriesResponse);
        
        if (categoriesResponse.data && Array.isArray(categoriesResponse.data)) {
          console.log('Raw categories:', categoriesResponse.data);
          
          // Sort categories in the specific order: Administrative first, then Academic, then IT Support
          const sortedCategories = [...categoriesResponse.data].sort((a, b) => {
            // Custom sorting function
            const getOrderPriority = (category) => {
              const name = category.name.toLowerCase();
              if (name.includes('admin') || name === 'administrative') return 1;
              if (name.includes('academic')) return 2;
              if (name.includes('it') || name.includes('support') || name === 'it support') return 3;
              return 4; // All other categories
            };
            
            const orderA = getOrderPriority(a);
            const orderB = getOrderPriority(b);
            
            return orderA - orderB; // Sort by priority (lowest number first)
          });
          
          console.log('Setting sorted categories:', sortedCategories);
          setCategories(sortedCategories);
        } else {
          console.error('Categories data is not in expected format:', categoriesResponse);
          setError('Failed to load categories. Please try again.');
        }

        // Fetch priorities
        console.log('Fetching priorities...');
        const prioritiesResponse = await api.get('/issues/priorities/');
        console.log('Priorities response:', prioritiesResponse);
        
        if (prioritiesResponse.data && Array.isArray(prioritiesResponse.data)) {
          console.log('Setting priorities:', prioritiesResponse.data);
          setPriorities(prioritiesResponse.data);
        } else {
          console.error('Priorities data is not in expected format:', prioritiesResponse);
          setError('Failed to load priorities. Please try again.');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        console.error('Error response:', error.response);
        console.error('Error status:', error.response?.status);
        console.error('Error data:', error.response?.data);
        
        if (error.response?.status === 401) {
          console.log('Unauthorized error detected, logging out...');
          await logout();
          navigate('/login', { state: { from: location.pathname } });
        } else {
          setError(`Failed to load data: ${error.response?.data?.message || error.message}`);
        }
      }
    };

    if (user) {
      fetchData();
    }
  }, [navigate, location.pathname, user, loading, logout]);

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('Title is required');
      return false;
    }
    if (!formData.description.trim()) {
      setError('Description is required');
      return false;
    }
    if (!formData.category) {
      setError('Category is required');
      return false;
    }
    if (!isStudentView && !formData.priority) {
      setError('Priority is required');
      return false;
    }
    return true;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    // Validate file size (10MB limit)
    const validFiles = files.filter(file => {
      if (file.size > 10 * 1024 * 1024) {
        setError(`File ${file.name} is too large. Maximum size is 10MB.`);
        return false;
      }
      return true;
    });
    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...validFiles]
    }));
  };

  const removeAttachment = (index) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setError('');

    try {
      // First upload any attachments
      const uploadedFileIds = [];
      for (const file of formData.attachments) {
        const uploadResponse = await uploadFile(file);
        uploadedFileIds.push(uploadResponse.id);
      }

      // Create the issue with the uploaded file IDs
      const issueData = {
        title: formData.title,
        description: formData.description,
        category: parseInt(formData.category),
        is_student_issue: isStudentView,
        attachments: uploadedFileIds
      };

      // Only include priority if it's not a student view
      if (!isStudentView && formData.priority) {
        issueData.priority = parseInt(formData.priority);
      }

      console.log('Submitting issue data:', issueData);
      const response = await createIssue(issueData);
      console.log('Issue creation response:', response);
      
      // Navigate to the correct issues list after successful creation
      const redirectUrl = isStudentView ? '/student/issues' : '/lecturer/issues';
      navigate(redirectUrl, { 
        state: { 
          successMessage: 'Issue created successfully!'
        } 
      });
    } catch (error) {
      console.error('Error creating issue:', error);
      console.error('Error response:', error.response);
      console.error('Error data:', error.response?.data);
      
      if (error.response?.status === 401) {
        // Handle unauthorized error by logging out
        await logout();
        navigate('/login', { state: { from: location.pathname } });
      } else {
        setError(error.response?.data?.message || 'Failed to create issue. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="text-blue-600 hover:text-blue-800 flex items-center"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" /> Back to Issues
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-2xl font-semibold text-gray-900">Create New Issue</h1>
        </div>

        <div className="px-6 py-4">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Enter a clear title for your issue"
              />
            </div>

            <div className={`grid ${isStudentView ? 'grid-cols-1' : 'grid-cols-2'} gap-6`}>
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  required
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Select a category</option>
                  {categories && categories.length > 0 ? (
                    categories.map(category => (
                      <option key={category.category_id} value={category.category_id}>
                        {category.name}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>No categories available</option>
                  )}
                </select>
                {categories.length === 0 && (
                  <p className="mt-1 text-sm text-gray-500">Loading categories...</p>
                )}
                {isStudentView && (
                  <p className="mt-1 text-sm text-gray-500">Priority will be automatically assigned based on the selected category.</p>
                )}
              </div>

              {!isStudentView && (
                <div>
                  <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    id="priority"
                    name="priority"
                    required
                    value={formData.priority}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">Select a priority</option>
                    {priorities && priorities.length > 0 ? (
                      priorities.map(priority => (
                        <option key={priority.priority_id} value={priority.priority_id}>
                          {priority.name}
                      </option>
                      ))
                    ) : (
                      <option value="" disabled>No priorities available</option>
                    )}
                  </select>
                  {priorities.length === 0 && (
                    <p className="mt-1 text-sm text-gray-500">Loading priorities...</p>
                  )}
                </div>
              )}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                required
                value={formData.description}
                onChange={handleInputChange}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Provide a detailed description of your issue"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Attachments
              </label>
              <div className="mt-1 border border-dashed border-gray-300 rounded-md p-6">
                <div className="text-center">
                  <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-2">
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <span className="text-blue-600 hover:text-blue-500">Upload files</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        multiple
                        className="sr-only"
                        onChange={handleFileChange}
                      />
                      <span className="text-gray-500"> or drag and drop</span>
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG, PDF up to 10MB each
                  </p>
                </div>
              </div>
              {formData.attachments.length > 0 && (
                <ul className="mt-3 space-y-2">
                  {formData.attachments.map((file, index) => (
                    <li key={index} className="flex items-center justify-between py-1">
                      <span className="text-sm text-gray-500">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeAttachment(index)}
                        className="text-sm text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200 mt-6">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isSubmitting ? 'Creating...' : 'Create Issue'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateIssue; 