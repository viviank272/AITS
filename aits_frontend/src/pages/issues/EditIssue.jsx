import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useIssues } from '../../contexts/IssuesContext'
import { PencilIcon } from '@heroicons/react/24/outline'

const EditIssue = () => {
  const { issueId } = useParams()
  const navigate = useNavigate()
  const { currentUser } = useAuth()
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

  useEffect(() => {
    const fetchIssue = async () => {
      try {
        const issueData = await getIssueById(issueId)
        if (!issueData) {
          setError('Issue not found')
          setLoading(false)
          return
        }

        // Check if the current user is the owner of the issue
        if (issueData.userId !== currentUser.uid) {
          setError('You do not have permission to edit this issue')
          setLoading(false)
          return
        }

        setIssue(issueData)
        setFormData({
          title: issueData.title,
          description: issueData.description,
          category: issueData.category,
          priority: issueData.priority
        })
      } catch (err) {
        setError('Failed to fetch issue details')
      } finally {
        setLoading(false)
      }
    }

    fetchIssue()
  }, [issueId, getIssueById, currentUser])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await updateIssue(issueId, formData)
      navigate(`/student/issues/${issueId}`)
    } catch (err) {
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

  if (loading) return <div className="flex justify-center items-center h-64">Loading...</div>
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