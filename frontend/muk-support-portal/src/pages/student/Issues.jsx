import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { getStudentIssues } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { PlusIcon, EyeIcon } from '@heroicons/react/24/outline';

function Issues() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [issues, setIssues] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [errorMessage, setErrorMessage] = useState('');
  const [categories, setCategories] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');

  // Function to fetch issues
  const fetchIssues = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      console.log('Fetching student issues...');
      const response = await getStudentIssues();
      console.log('Issues response:', response);
      
      if (Array.isArray(response)) {
        // Log sample issue to inspect structure
        if (response.length > 0) {
          console.log('Sample issue structure:', response[0]);
          console.log('Category type:', typeof response[0].category);
          console.log('Status type:', typeof response[0].status);
          console.log('Priority type:', typeof response[0].priority);
        }
        
        setIssues(response);
        
        // Extract unique categories
        const uniqueCategories = [...new Set(response
          .filter(issue => issue.category_name || 
            (issue.category && typeof issue.category === 'object' && issue.category.name))
          .map(issue => issue.category_name || 
            (issue.category && typeof issue.category === 'object' ? issue.category.name : null))
          .filter(Boolean)
        )];
        
        setCategories(uniqueCategories);
      } else {
        console.error('Issues data is not in expected format:', response);
        setErrorMessage('Failed to load issues. Please try again.');
      }
    } catch (error) {
      console.error('Error fetching issues:', error);
      
      if (error.response?.status === 401) {
        console.log('Unauthorized error detected, logging out...');
        await logout();
        navigate('/login', { state: { from: '/student/issues' } });
      } else {
        setErrorMessage(`Failed to load issues: ${error.response?.data?.message || error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check if user is authenticated
    if (!user) {
      navigate('/login', { state: { from: '/student/issues' } });
      return;
    }

    // Check for success message in location state
    if (location.state?.successMessage) {
      setSuccessMessage(location.state.successMessage);
      // Clear the success message from location state
      window.history.replaceState({}, document.title);
      // Clear the success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
    }

    // Fetch issues from the backend
    fetchIssues();
  }, [navigate, user, logout, location.state]);

  const filteredIssues = issues.filter(issue => {
    const matchesSearch = issue.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         issue.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const statusName = issue.status_name || 
                       (issue.status && typeof issue.status === 'object' ? issue.status.name : null);
    
    const categoryName = issue.category_name || 
                        (issue.category && typeof issue.category === 'object' ? issue.category.name : null);
    
    const matchesStatus = filterStatus === 'all' || 
                         (statusName && statusName.toLowerCase() === filterStatus);
    
    const matchesCategory = filterCategory === 'all' || 
                           (categoryName === filterCategory);
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">My Issues</h1>
          <Link
            to="/student/issues/create"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Create New Issue
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white shadow rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <input
                type="text"
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Search issues..."
              />
            </div>
            <div>
              <select
                id="category"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="all">All Categories</option>
                {categories.map((category, index) => (
                  <option key={index} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div>
              <select
                id="status"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
          </div>
        </div>

        {/* Display error message if present */}
        {errorMessage && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{errorMessage}</p>
          </div>
        )}

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

        {/* Issues Table */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Issue ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time Created
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredIssues.length > 0 ? (
                  filteredIssues.map((issue) => {
                    // Log each issue for debugging
                    console.log(`Issue ${issue.issue_id} category:`, issue.category);
                    console.log(`Issue ${issue.issue_id} status:`, issue.status);
                    console.log(`Issue ${issue.issue_id} priority:`, issue.priority);
                    
                    return (
                      <tr key={issue.issue_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{issue.issue_id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {issue.title}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {issue.category_name || 
                              (issue.category && typeof issue.category === 'object' && issue.category.name ? 
                                issue.category.name : 
                                (typeof issue.category === 'number' ? `Category ID: ${issue.category}` : 'N/A'))}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {(() => {
                            const statusName = issue.status_name || 
                              (issue.status && typeof issue.status === 'object' && issue.status.name ? 
                                issue.status.name : 
                                (typeof issue.status === 'number' ? `Status ID: ${issue.status}` : 'N/A'));
                            
                            let bgColor = 'bg-gray-100';
                            let textColor = 'text-gray-800';
                            
                            if (statusName.toLowerCase().includes('open')) {
                              bgColor = 'bg-green-100';
                              textColor = 'text-green-800';
                            } else if (statusName.toLowerCase().includes('in progress')) {
                              bgColor = 'bg-blue-100';
                              textColor = 'text-blue-800';
                            } else if (statusName.toLowerCase().includes('resolved')) {
                              bgColor = 'bg-cyan-100';
                              textColor = 'text-cyan-800';
                            } else if (statusName.toLowerCase().includes('closed')) {
                              bgColor = 'bg-gray-100';
                              textColor = 'text-gray-800';
                            } else if (statusName.toLowerCase().includes('pending')) {
                              bgColor = 'bg-orange-100';
                              textColor = 'text-orange-800';
                            }
                            
                            return (
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
                                {statusName}
                              </span>
                            );
                          })()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {(() => {
                            const priorityName = issue.priority_name || 
                              (issue.priority && typeof issue.priority === 'object' && issue.priority.name ? 
                                issue.priority.name : 
                                (typeof issue.priority === 'number' ? `Priority ID: ${issue.priority}` : 'N/A'));
                            
                            let bgColor = 'bg-gray-100';
                            let textColor = 'text-gray-800';
                            
                            if (priorityName.toLowerCase().includes('critical')) {
                              bgColor = 'bg-red-100';
                              textColor = 'text-red-800';
                            } else if (priorityName.toLowerCase().includes('high')) {
                              bgColor = 'bg-orange-100';
                              textColor = 'text-orange-800';
                            } else if (priorityName.toLowerCase().includes('medium')) {
                              bgColor = 'bg-yellow-100';
                              textColor = 'text-yellow-800';
                            } else if (priorityName.toLowerCase().includes('low')) {
                              bgColor = 'bg-green-100';
                              textColor = 'text-green-800';
                            }
                            
                            return (
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
                                {priorityName}
                              </span>
                            );
                          })()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(issue.created_at).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                          <Link 
                            to={`/student/issues/${issue.issue_id}`} 
                            className="inline-flex items-center justify-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-10 text-center text-gray-500">
                      No issues found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Issues; 