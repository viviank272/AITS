import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getIssueById, getIssueComments, postComment } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  ArrowLeftIcon,
  ChatBubbleLeftIcon,
  ClockIcon,
  UserIcon,
  TagIcon,
  PaperClipIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ClockIcon as ClockIconSolid,
  UserCircleIcon,
  XMarkIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline';

function IssueDetails() {
  const { issueId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const isStudentView = location.pathname.includes('/student/');
  const isLecturerView = location.pathname.includes('/lecturer/');
  
  const [loading, setLoading] = useState(true);
  const [issue, setIssue] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [updateText, setUpdateText] = useState('');
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [error, setError] = useState('');
  const [commentError, setCommentError] = useState('');

  useEffect(() => {
    const fetchIssueDetails = async () => {
      setLoading(true);
      setComments([]); // Reset comments when fetching new issue
      try {
        console.log('Fetching issue with ID:', issueId);
        console.log('Current user:', user);
        console.log('Auth token:', localStorage.getItem('access'));
        
        // First fetch the issue details
        const issueData = await getIssueById(issueId);
        console.log('Issue data received:', issueData);
        
        if (issueData) {
          setIssue(issueData);
          
          // Then try to fetch comments
          try {
            console.log('Fetching comments for issue:', issueId);
            const commentsData = await getIssueComments(issueId);
            console.log('Comments data received:', commentsData);
            if (Array.isArray(commentsData)) {
              setComments(commentsData);
            } else {
              console.error('Comments data is not an array:', commentsData);
              setComments([]);
            }
          } catch (commentsError) {
            console.error('Error fetching comments:', commentsError);
            console.error('Comments error response:', commentsError.response?.data);
            console.error('Comments error status:', commentsError.response?.status);
            console.error('Comments error headers:', commentsError.response?.headers);
            setComments([]);
          }
        } else {
          setError('Issue not found');
          navigate(isStudentView ? '/student/issues' : '/lecturer/issues', { replace: true });
        }
      } catch (error) {
        console.error('Error fetching issue details:', error);
        console.error('Error response:', error.response?.data);
        console.error('Error status:', error.response?.status);
        console.error('Error headers:', error.response?.headers);
        
        if (error.response?.status === 401) {
          console.log('Unauthorized error detected, logging out...');
          await logout();
          navigate('/login', { state: { from: location.pathname } });
        } else if (error.response?.status === 404) {
          setError('Issue not found');
          navigate(isStudentView ? '/student/issues' : '/lecturer/issues', { replace: true });
        } else {
          setError(`Failed to load issue details: ${error.response?.data?.message || error.message}`);
        }
      } finally {
        setLoading(false);
      }
    };

    if (issueId) {
      fetchIssueDetails();
    }
  }, [issueId, navigate, isStudentView, location.pathname, logout, user]);

  const updateIssueStatus = (newStatus) => {
    // In a real app, this would be an API call
    setIssue(prevIssue => ({
      ...prevIssue,
      status: newStatus
    }));
    
    // Add status update to updates list
    const statusUpdate = {
      id: issue.updates.length + 1,
      user: 'Dr. John Doe', // This would be the current user in a real app
      timestamp: new Date().toLocaleString(),
      content: `Status changed to ${newStatus}`
    };
    
    setIssue(prevIssue => ({
      ...prevIssue,
      updates: [...prevIssue.updates, statusUpdate]
    }));
    
    setStatusDropdownOpen(false);
  };

  const addUpdate = () => {
    if (!updateText.trim()) return;
    
    // Add the new update
    const newUpdate = {
      id: issue.updates.length + 1,
      user: 'Dr. John Doe', // This would be the current user in a real app
      timestamp: new Date().toLocaleString(),
      content: updateText
    };
    
    setIssue(prevIssue => ({
      ...prevIssue,
      updates: [...prevIssue.updates, newUpdate]
    }));
    
    setUpdateText('');
  };

  const handleResolveIssue = () => {
    setShowResolveModal(true);
  };

  const confirmResolveIssue = () => {
    // Update status without adding duplicate message
    setIssue(prevIssue => ({
      ...prevIssue,
      status: 'Resolved'
    }));
    
    // Add a resolution update only once
    const resolutionUpdate = {
      id: issue.updates.length + 1,
      user: 'Dr. John Doe', // This would be the current user in a real app
      timestamp: new Date().toLocaleString(),
      content: 'Issue has been resolved.'
    };
    
    setIssue(prevIssue => ({
      ...prevIssue,
      updates: [...prevIssue.updates, resolutionUpdate]
    }));
    
    setShowResolveModal(false);
  };

  const handleCloseIssue = () => {
    setShowCloseModal(true);
  };

  const confirmCloseIssue = () => {
    // Update status without adding duplicate message
    setIssue(prevIssue => ({
      ...prevIssue,
      status: 'Closed'
    }));
    
    // Add a closure update only once
    const closureUpdate = {
      id: issue.updates.length + 1,
      user: 'Dr. John Doe', // This would be the current user in a real app
      timestamp: new Date().toLocaleString(),
      content: 'Issue has been closed.'
    };
    
    setIssue(prevIssue => ({
      ...prevIssue,
      updates: [...prevIssue.updates, closureUpdate]
    }));
    
    setShowCloseModal(false);
  };

  const addComment = async () => {
    if (!newComment.trim()) return;
    setCommentError('');

    try {
      console.log('Posting comment for issue:', issueId);
      console.log('Comment data:', { content: newComment, is_internal: false });
      
      const commentData = {
        content: newComment,
        is_internal: false
      };

      const response = await postComment(issueId, commentData);
      console.log('Comment posted successfully:', response);
      
      // Add the new comment to the list
      setComments(prevComments => [...prevComments, response]);
      setNewComment('');
    } catch (error) {
      console.error('Error posting comment:', error);
      console.error('Comment error response:', error.response?.data);
      console.error('Comment error status:', error.response?.status);
      console.error('Comment error headers:', error.response?.headers);
      setCommentError('Failed to post comment. Please try again.');
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <ExclamationCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
              <div className="mt-2 text-sm text-red-700">
                <button
                  onClick={() => navigate(isStudentView ? '/student/issues' : '/lecturer/issues')}
                  className="font-medium text-red-800 hover:text-red-900"
                >
                  Return to issues
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!issue) {
    navigate(isStudentView ? '/student/issues' : '/lecturer/issues', { replace: true });
    return null;
  }

  return (
    <div className="p-8">
      {/* Resolve Modal */}
      {showResolveModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
                    <CheckCircleIcon className="h-6 w-6 text-green-600" aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      Resolve Issue
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to resolve this issue? This will mark the issue as resolved and notify the student.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={confirmResolveIssue}
                >
                  Resolve
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowResolveModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Close Modal */}
      {showCloseModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 sm:mx-0 sm:h-10 sm:w-10">
                    <XMarkIcon className="h-6 w-6 text-gray-600" aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      Close Issue
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to close this issue? Closed issues cannot be reopened and will be archived.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-gray-600 text-base font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={confirmCloseIssue}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowCloseModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="text-blue-600 hover:text-blue-800 flex items-center"
        >
          ← Back to Issues
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                {issue.title}
              </h1>
              <p className="mt-1 text-sm text-gray-500">Issue #{issue.id}</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                issue.status === 'Open' ? 'bg-blue-100 text-blue-800' :
                issue.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                issue.status === 'Resolved' ? 'bg-green-100 text-green-800' :
                issue.status === 'Closed' ? 'bg-gray-100 text-gray-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {issue.status}
              </span>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                issue.priority === 'High' ? 'bg-red-100 text-red-800' :
                issue.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                {issue.priority}
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          <div className="flex flex-row gap-6">
            {/* Main Content */}
            <div className="flex-1">
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-medium text-gray-900">Description</h2>
                  <p className="mt-2 text-gray-600">{issue.description}</p>
                </div>

                {/* Comments Section */}
                <div className="mt-8">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">Comments</h3>
                  </div>
                  
                  {commentError && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-sm text-red-600">{commentError}</p>
                    </div>
                  )}

                  <div className="mt-4">
                    <div className="flex space-x-3">
                      <div className="flex-shrink-0">
                        <UserCircleIcon className="h-8 w-8 text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="border border-gray-300 rounded-lg shadow-sm overflow-hidden">
                          <div className="p-4">
                            <textarea
                              rows={3}
                              value={newComment}
                              onChange={(e) => setNewComment(e.target.value)}
                              className="block w-full border-0 p-0 text-gray-900 placeholder-gray-500 focus:ring-0 sm:text-sm"
                              placeholder="Add a comment..."
                            />
                          </div>
                          <div className="bg-gray-50 px-4 py-3 flex justify-end">
                            <button
                              type="button"
                              onClick={addComment}
                              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                              <PaperAirplaneIcon className="h-4 w-4 mr-2" />
                              Post Comment
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 space-y-6">
                    {Array.isArray(comments) && comments.length > 0 ? (
                      comments.map((comment) => (
                        <div key={`comment-${comment.comment_id}`} className="flex space-x-3">
                          <div className="flex-shrink-0">
                            <UserCircleIcon className="h-8 w-8 text-gray-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="bg-white rounded-lg shadow-sm p-4">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-gray-900">
                                  {comment.user_details?.full_name || 'Anonymous'}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {new Date(comment.created_at).toLocaleString()}
                                </p>
                              </div>
                              <p className="mt-2 text-sm text-gray-700">
                                {comment.content}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-gray-500 py-4">
                        No comments yet. Be the first to comment!
                      </div>
                    )}
                  </div>
                </div>

                {/* Updates Section - Only visible to staff */}
                {!isStudentView && (
                  <>
                    <div>
                      <h2 className="text-lg font-medium text-gray-900">Updates</h2>
                      <div className="mt-2 space-y-4">
                        {issue.updates.map((update) => (
                          <div key={update.id} className="bg-yellow-50 rounded-lg p-4 border-l-4 border-yellow-300">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-gray-900">{update.user}</span>
                              <span className="text-sm text-gray-500">{update.timestamp}</span>
                            </div>
                            <p className="mt-2 text-gray-600">{update.content}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h2 className="text-lg font-medium text-gray-900">Add Update</h2>
                      <div className="mt-2">
                        <textarea
                          rows="4"
                          value={updateText}
                          onChange={(e) => setUpdateText(e.target.value)}
                          className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Type your update here..."
                        />
                        <button
                          onClick={addUpdate}
                          className="mt-2 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700">
                          Post Update
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default IssueDetails; 