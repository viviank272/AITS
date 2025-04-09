import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useIssues } from '../../context/IssuesContext'
import { PencilIcon } from '@heroicons/react/24/outline'

const EditIssue = () => {
  const { issueId } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const { getIssueById, updateIssue } = useIssues()
  const [issue, setIssue] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium'
  })
  const [issueLoaded, setIssueLoaded] = useState(false)
  // For development only - set to true to bypass permission checks
  const [bypassPermissionChecks] = useState(true)

  useEffect(() => {
    // Wait for auth to be ready
    if (authLoading) {
      console.log('Auth is still loading...')
      return
    }

    // Prevent multiple fetches
    if (issueLoaded) {
      return
    }

    const fetchIssue = async () => {
      try {
        console.log('Authentication state:', { isAuthenticated, user })
        
        // Only redirect if explicitly not authenticated
        if (isAuthenticated === false) {
          console.log('User not authenticated, redirecting to login')
          navigate('/login')
          return
        }

        if (!user) {
          console.error('User not initialized even though authenticated')
          setError('Please log in to edit issues')
          setLoading(false)
          return
        }

        console.log('Fetching issue with ID:', issueId)
        const issueData = await getIssueById(issueId)
        console.log('Fetched issue data:', issueData)
        
        if (!issueData) {
          console.error('No issue data received')
          setError('Issue not found')
          setLoading(false)
          return
        }

        if (!issueData.reporter_details) {
          console.error('Issue has no reporter details:', issueData)
          setError('Issue data is incomplete')
          setLoading(false)
          return
        }

        // Detailed user object log to understand its structure
        console.log('User object details:', {
          userType: typeof user,
          userKeys: Object.keys(user),
          userJSON: JSON.stringify(user),
          userIdType: typeof user.user_id,
          userId: user.user_id
        })

        // Detailed reporter object log
        console.log('Reporter details:', {
          reporterType: typeof issueData.reporter_details,
          reporterKeys: Object.keys(issueData.reporter_details),
          reporterJSON: JSON.stringify(issueData.reporter_details),
          reporterIdType: typeof issueData.reporter_details.user_id,
          reporterId: issueData.reporter_details.user_id
        })

        // Check if the user is allowed to edit this issue
        // Allow editing if:
        // 1. User is the reporter (owner)
        // 2. User has staff or admin privileges
        // 3. User is assigned to this issue (if applicable)
        // 4. TEMPORARY: Allow all authenticated users to edit for testing

        const isOwner = String(issueData.reporter_details.user_id) === String(user.user_id)
        
        // Check for admin/staff privileges - handle different possible structures
        const isStaff = user.is_staff === true || 
                      user.role === 'admin' || 
                      user.is_superuser === true ||
                      (user.user_type && (user.user_type === 'admin' || user.user_type === 'staff'))
        
        const isAssigned = issueData.assignee_details && 
                          String(issueData.assignee_details.user_id) === String(user.user_id)
        
        console.log('Permission check:', {
          user,
          isOwner,
          isStaff,
          isAssigned,
          bypassChecks: bypassPermissionChecks,
          reporter: issueData.reporter_details,
          assignee: issueData.assignee_details
        })

        // Check permissions unless bypassed for testing
        if (!bypassPermissionChecks && !(isOwner || isStaff || isAssigned)) {
          console.log('Permission denied - User does not have the right permissions')
          setError('You do not have permission to edit this issue')
          setLoading(false)
          return
        }

        console.log('User has permission to edit this issue')
        setIssue(issueData)
        setFormData({
          title: issueData.title || '',
          description: issueData.description || '',
          category: issueData.category_details?.name || '',
          priority: issueData.priority_details?.name?.toLowerCase() || 'medium'
        })
        
        // Mark issue as loaded to prevent infinite loop
        setIssueLoaded(true)
      } catch (err) {
        console.error('Error in fetchIssue:', err)
        setError(err.message || 'Failed to fetch issue details')
      } finally {
        setLoading(false)
      }
    }

    if (!authLoading && !issueLoaded) {
      fetchIssue()
    }
  }, [issueId, getIssueById, user, isAuthenticated, navigate, authLoading, issueLoaded, bypassPermissionChecks])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await updateIssue(issueId, formData)
      navigate(`/student/issues/${issueId}`)
    } catch (err) {
      console.error('Failed to update issue:', err)
      setError('Failed to update issue')
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  if (authLoading || loading) return <div className="flex justify-center items-center h-64">Loading...</div>
  if (error) return <div className="flex justify-center items-center h-64 text-red-500">{error}</div>
  if (!issue) return <div className="flex justify-center items-center h-64">Issue not found</div>

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Edit Issue</h1>
        <button
          onClick={() => navigate(`/student/issues/${issueId}`)}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
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
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          >
            <option value="">Select a category</option>
            <option value="academic">Academic</option>
            <option value="technical">Technical</option>
            <option value="administrative">Administrative</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
            Priority
          </label>
          <select
            id="priority"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
          >
            <PencilIcon className="h-5 w-5 mr-2" />
            Update Issue
          </button>
        </div>
      </form>
    </div>
  )
}

export default EditIssue 