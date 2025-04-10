import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useIssues } from '../../context/IssuesContext'
import { PencilIcon, PaperClipIcon, ArrowLeftIcon, PhotoIcon } from '@heroicons/react/24/outline'
import api from '../../services/api'

const EditIssue = () => {
  const { issueId } = useParams()
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const { getIssueById, updateIssue } = useIssues()
  const [issue, setIssue] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [categories, setCategories] = useState([])
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium',
    attachments: []
  })
  const [selectedFiles, setSelectedFiles] = useState([])
  const [uploading, setUploading] = useState(false)

  // Fetch categories from backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/issues/categories/')
        if (response.data && Array.isArray(response.data)) {
          // Sort categories in specific order: Administrative first, then Academic, then IT Support
          const sortedCategories = [...response.data].sort((a, b) => {
            const getOrderPriority = (category) => {
              const name = category.name.toLowerCase();
              if (name.includes('admin') || name === 'administrative') return 1;
              if (name.includes('academic')) return 2;
              if (name.includes('it') || name.includes('support')) return 3;
              return 4;
            };
            return getOrderPriority(a) - getOrderPriority(b);
          });
          setCategories(sortedCategories);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Failed to load categories');
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchIssue = async () => {
      if (!issueId) return;
      
      try {
        const issueData = await getIssueById(issueId)
        if (!issueData) {
          setError('Issue not found')
          return
        }

        // Check if the current user is the owner of the issue
        if (issueData.userId !== currentUser?.uid) {
          setError('You do not have permission to edit this issue')
          return
        }

        setIssue(issueData)
        setFormData({
          title: issueData.title || '',
          description: issueData.description || '',
          category: issueData.category?.id || issueData.category || '',
          priority: issueData.priority || 'medium',
          attachments: issueData.attachments || []
        })
      } catch (err) {
        setError('Failed to fetch issue details')
      } finally {
        setLoading(false)
      }
    }

    fetchIssue()
  }, [issueId, currentUser?.uid])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setUploading(true)
      
      // First, upload any new files
      const formDataWithFiles = new FormData()
      selectedFiles.forEach(file => {
        formDataWithFiles.append('files[]', file)
      })

      // Add other form data
      formDataWithFiles.append('title', formData.title)
      formDataWithFiles.append('description', formData.description)
      formDataWithFiles.append('category', formData.category)
      formDataWithFiles.append('priority', formData.priority)
      
      await updateIssue(issueId, formDataWithFiles)
      navigate(`/student/issues/${issueId}`)
    } catch (err) {
      setError('Failed to update issue')
    } finally {
      setUploading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
    setSelectedFiles(prev => [...prev, ...files])
  }

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  if (loading) return <div className="flex justify-center items-center h-64">Loading...</div>
  if (error) return <div className="flex justify-center items-center h-64 text-red-500">{error}</div>
  if (!issue) return <div className="flex justify-center items-center h-64">Issue not found</div>

  return (
    <div className="h-full p-4">
      <div className="mb-4">
        <button
          onClick={() => navigate(-1)}
          className="text-blue-600 hover:text-blue-800 flex items-center"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" /> Back to Issues
        </button>
      </div>

      <div className="bg-white rounded-lg shadow h-[calc(100vh-120px)] overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-900">Edit Issue</h1>
        </div>

        <div className="px-4 py-3 h-[calc(100%-60px)] overflow-y-auto">
          {error && (
            <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Enter a clear title for your issue"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Provide a detailed description of the issue"
                required
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                Category
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Attachments
              </label>
              
              {/* Existing attachments */}
              {formData.attachments.length > 0 && (
                <div className="mt-1 p-3 bg-gray-50 rounded-md">
                  <p className="text-sm font-medium text-gray-700 mb-1">Current attachments:</p>
                  {formData.attachments.map((attachment, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                      <PaperClipIcon className="h-4 w-4 text-gray-400" />
                      <span className="flex-1">{attachment.name || attachment}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* New file upload */}
              <div className="mt-1">
                <div className="flex justify-center px-4 py-3 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <PhotoIcon className="mx-auto h-8 w-8 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                        <span>Upload files</span>
                        <input
                          id="file-upload"
                          type="file"
                          multiple
                          onChange={handleFileChange}
                          className="sr-only"
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      PNG, JPG, PDF up to 10MB each
                  </p>
                  </div>
                </div>
              </div>

              {/* Selected files preview */}
              {selectedFiles.length > 0 && (
                <div className="mt-2 p-3 bg-gray-50 rounded-md">
                  <p className="text-sm font-medium text-gray-700 mb-1">Selected files to upload:</p>
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <PaperClipIcon className="h-4 w-4 text-gray-400" />
                        <span>{file.name}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-red-500 hover:text-red-700 font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="mr-3 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={uploading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <PencilIcon className="h-5 w-5 mr-2" />
                {uploading ? 'Updating...' : 'Update Issue'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default EditIssue 