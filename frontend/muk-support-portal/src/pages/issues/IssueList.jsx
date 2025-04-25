import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { getAllIssues, getStudentIssues, getLecturerIssues } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

function IssueList({ type }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const isStudent = location.pathname.startsWith('/student');
  const isLecturer = location.pathname.startsWith('/lecturer');
  const [loading, setLoading] = useState(true);
  const [issues, setIssues] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [error, setError] = useState('');
  const [categories, setCategories] = useState([]);

  // Function to fetch issues
  const fetchIssues = async () => {
    setLoading(true);
    setError('');
    try {
      console.log('Starting to fetch issues...');
      console.log('Current user:', user);
      console.log('Current path:', location.pathname);
      console.log('Is student:', isStudent);
      console.log('Is lecturer:', isLecturer);
      
      let response;
      let endpoint;
      
      if (isStudent) {
        console.log('Fetching student issues');
        endpoint = '/issues/student/';
        response = await getStudentIssues();
      } else if (isLecturer) {
        console.log('Fetching lecturer issues');
        endpoint = '/issues/lecturer/';
        response = await getLecturerIssues();
      } else {
        console.log('Fetching all issues');
        endpoint = '/issues/';
        response = await getAllIssues();
      }
      
      console.log('API Response:', response);
      
      if (Array.isArray(response)) {
        console.log('Setting issues:', response);
        setIssues(response);
        
        // Extract unique categories
        const uniqueCategories = [...new Set(response.map(issue => issue.category))];
        console.log('Unique categories:', uniqueCategories);
        setCategories(uniqueCategories);
      } else {
        console.error('Issues data is not in expected format:', response);
        setError('Failed to load issues. Please try again.');
      }
    } catch (error) {
      console.error('Error fetching issues:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      if (error.response?.status === 401) {
        console.log('Unauthorized error detected, logging out...');
        await logout();
        navigate('/login', { state: { from: location.pathname } });
      } else {
        setError(`Failed to load issues: ${error.response?.data?.message || error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('IssueList component mounted');
    console.log('Current user:', user);
    console.log('Current path:', location.pathname);
    
    // Check if user is authenticated
    if (!user) {
      console.log('No user found, redirecting to login');
      navigate('/login', { state: { from: location.pathname } });
      return;
    }

    // Fetch issues from the backend
    fetchIssues();
  }, [navigate, location.pathname, user, type, logout]);

  const getTitle = () => {
    if (type === 'assigned') {
      return 'Assigned Issues';
    } else if (type === 'department') {
      return 'Department Issues';
    } else if (type === 'my') {
      return 'My Issues';
    }
    return 'My Issues';
  };

  const filteredIssues = issues.filter(issue => {
    const matchesSearch = issue.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         issue.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || issue.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || issue.category === filterCategory;
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
            <h1 className="text-2xl font-semibold text-gray-900">{getTitle()}</h1>
          <Link
            to={isStudent ? "/student/issues/create" : isLecturer ? "/lecturer/issues/create" : "/issues/create"}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Create New Issue
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white shadow rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Search issues..."
                />
              </div>
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
                    Created
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredIssues.length > 0 ? (
                  filteredIssues.map((issue) => (
                    <tr key={issue.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{issue.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {issue.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {issue.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {issue.status?.replace('_', ' ')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(issue.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link 
                          to={`${isStudent ? '/student' : isLecturer ? '/lecturer' : ''}/issues/${issue.id}`} 
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-10 text-center text-gray-500">
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

export default IssueList; 