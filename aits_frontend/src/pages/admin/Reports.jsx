import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChartBar,
  faChartLine,
  faChartPie,
  faDownload,
  faFilter,
  faCalendar,
  faUsers,
  faExclamationTriangle,
  faCheckCircle,
  faClock,
  faFileAlt
} from '@fortawesome/free-solid-svg-icons';
import '../../utils/fontawesome';
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ArrowDownTrayIcon,
  FunnelIcon,
  CalendarIcon,
  UsersIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  DocumentTextIcon,
  UserPlusIcon
} from '@heroicons/react/24/outline';

const Reports = () => {
  const location = useLocation();
  const exportButtonRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('week');
  const [reportType, setReportType] = useState('overview');
  const [showExportModal, setShowExportModal] = useState(false);
  const [issuesData, setIssuesData] = useState({
    total: 0,
    resolved: 0,
    pending: 0,
    averageResolutionTime: 0,
    trends: [],
    byCategory: [],
    byStatus: []
  });
  const [usersData, setUsersData] = useState({
    total: 0,
    active: 0,
    new: 0,
    byRole: [],
    activity: []
  });

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setIssuesData({
        total: 150,
        resolved: 120,
        pending: 30,
        averageResolutionTime: 2.5,
        trends: [
          { date: '2024-01-01', count: 10 },
          { date: '2024-01-02', count: 15 },
          { date: '2024-01-03', count: 8 },
          { date: '2024-01-04', count: 20 },
          { date: '2024-01-05', count: 12 },
          { date: '2024-01-06', count: 18 },
          { date: '2024-01-07', count: 14 }
        ],
        byCategory: [
          { category: 'Technical', count: 45, percentage: 30 },
          { category: 'Academic', count: 35, percentage: 23 },
          { category: 'Access', count: 25, percentage: 17 },
          { category: 'Other', count: 45, percentage: 30 }
        ],
        byStatus: [
          { status: 'Open', count: 30, percentage: 20 },
          { status: 'In Progress', count: 45, percentage: 30 },
          { status: 'Resolved', count: 75, percentage: 50 }
        ]
      });

      setUsersData({
        total: 2458,
        active: 2150,
        new: 108,
        byRole: [
          { role: 'Students', count: 1800, percentage: 73 },
          { role: 'Faculty', count: 400, percentage: 16 },
          { role: 'Staff', count: 258, percentage: 11 }
        ],
        activity: [
          { date: '2024-01-01', active: 1800 },
          { date: '2024-01-02', active: 1850 },
          { date: '2024-01-03', active: 1900 },
          { date: '2024-01-04', active: 1950 },
          { date: '2024-01-05', active: 2000 },
          { date: '2024-01-06', active: 2050 },
          { date: '2024-01-07', active: 2150 }
        ]
      });

      setLoading(false);
      
      // Check URL parameters for actions
      const searchParams = new URLSearchParams(location.search);
      const action = searchParams.get('action');
      
      if (action === 'export') {
        // Set a small timeout to ensure the UI is fully rendered
        setTimeout(() => {
          setShowExportModal(true);
          if (exportButtonRef.current) {
            exportButtonRef.current.focus();
          }
        }, 100);
      }
    }, 1000);
  }, [location, dateRange]);

  const handleDateRangeChange = (e) => {
    setDateRange(e.target.value);
    // Fetch new data based on date range
  };

  const handleReportTypeChange = (type) => {
    setReportType(type);
    // Fetch new data based on report type
  };

  const handleExport = () => {
    // Set show export modal to true
    setShowExportModal(true);
  };
  
  const handleExportConfirm = (format) => {
    // Implement export functionality
    console.log(`Exporting report in ${format} format...`);
    // In a real application, this would initiate a download
    alert(`Report exported in ${format} format`);
    setShowExportModal(false);
  };
  
  const handleExportCancel = () => {
    setShowExportModal(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <ChartBarIcon className="h-6 w-6 text-gray-400 mr-2" />
            <h1 className="text-2xl font-semibold text-gray-900">Reports & Analytics</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <select
                value={dateRange}
                onChange={handleDateRangeChange}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
                <option value="quarter">Last Quarter</option>
                <option value="year">Last Year</option>
              </select>
              <CalendarIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            </div>
            <button
              ref={exportButtonRef}
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-[#1e1e77] text-white rounded-lg hover:bg-[#2a2a8f]"
            >
              <ArrowDownTrayIcon className="h-5 w-5" />
              Export Report
            </button>
          </div>
        </div>

        {/* Report Type Selection */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => handleReportTypeChange('overview')}
              className={`${
                reportType === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              <ChartBarIcon className="h-5 w-5 inline-block mr-2" />
              Overview
            </button>
            <button
              onClick={() => handleReportTypeChange('issues')}
              className={`${
                reportType === 'issues'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              <ExclamationTriangleIcon className="h-5 w-5 inline-block mr-2" />
              Issues
            </button>
            <button
              onClick={() => handleReportTypeChange('users')}
              className={`${
                reportType === 'users'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              <UsersIcon className="h-5 w-5 inline-block mr-2" />
              Users
            </button>
          </nav>
        </div>

        {/* Content */}
        {reportType === 'issues' ? (
          <div className="space-y-8">
            {/* Issues Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-500">Total Issues</h3>
                  <ExclamationTriangleIcon className="h-5 w-5 text-blue-500" />
                </div>
                <p className="mt-2 text-3xl font-semibold text-gray-900">{issuesData.total}</p>
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                  <span>12% from last period</span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-500">Resolved Issues</h3>
                  <CheckCircleIcon className="h-5 w-5 text-green-500" />
                </div>
                <p className="mt-2 text-3xl font-semibold text-gray-900">{issuesData.resolved}</p>
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                  <span>8% from last period</span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-500">Pending Issues</h3>
                  <ClockIcon className="h-5 w-5 text-yellow-500" />
                </div>
                <p className="mt-2 text-3xl font-semibold text-gray-900">{issuesData.pending}</p>
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <ArrowTrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
                  <span>5% from last period</span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-500">Avg Resolution Time</h3>
                  <ClockIcon className="h-5 w-5 text-purple-500" />
                </div>
                <p className="mt-2 text-3xl font-semibold text-gray-900">{issuesData.averageResolutionTime} days</p>
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <ArrowTrendingDownIcon className="h-4 w-4 text-green-500 mr-1" />
                  <span>0.5 days faster</span>
                </div>
              </div>
            </div>

            {/* Issues Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Issue Trends */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Issue Trends</h3>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <p className="text-gray-500">Chart will be implemented here</p>
                </div>
              </div>

              {/* Category Distribution */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Category Distribution</h3>
                <div className="space-y-4">
                  {issuesData.byCategory.map((item, index) => (
                    <div key={index}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">{item.category}</span>
                        <span className="text-sm text-gray-500">{item.count} issues</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${item.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : reportType === 'users' ? (
          <div className="space-y-8">
            {/* Users Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
                  <UsersIcon className="h-5 w-5 text-blue-500" />
                </div>
                <p className="mt-2 text-3xl font-semibold text-gray-900">{usersData.total}</p>
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                  <span>5% from last period</span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-500">Active Users</h3>
                  <CheckCircleIcon className="h-5 w-5 text-green-500" />
                </div>
                <p className="mt-2 text-3xl font-semibold text-gray-900">{usersData.active}</p>
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                  <span>3% from last period</span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-500">New Users</h3>
                  <UserPlusIcon className="h-5 w-5 text-yellow-500" />
                </div>
                <p className="mt-2 text-3xl font-semibold text-gray-900">{usersData.new}</p>
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                  <span>This month</span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-500">User Growth</h3>
                  <ChartBarIcon className="h-5 w-5 text-purple-500" />
                </div>
                <p className="mt-2 text-3xl font-semibold text-gray-900">4.5%</p>
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                  <span>Monthly growth rate</span>
                </div>
              </div>
            </div>

            {/* Users Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* User Activity */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-4">User Activity</h3>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <p className="text-gray-500">Chart will be implemented here</p>
                </div>
              </div>

              {/* User Distribution */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-4">User Distribution</h3>
                <div className="space-y-4">
                  {usersData.byRole.map((item, index) => (
                    <div key={index}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">{item.role}</span>
                        <span className="text-sm text-gray-500">{item.count} users</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${item.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Overview content
          <div className="space-y-8">
            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-500">Total Issues</h3>
                  <ExclamationTriangleIcon className="h-5 w-5 text-blue-500" />
                </div>
                <p className="mt-2 text-3xl font-semibold text-gray-900">{issuesData.total}</p>
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                  <span>12% from last period</span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
                  <UsersIcon className="h-5 w-5 text-green-500" />
                </div>
                <p className="mt-2 text-3xl font-semibold text-gray-900">{usersData.total}</p>
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                  <span>5% from last period</span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-500">Active Users</h3>
                  <CheckCircleIcon className="h-5 w-5 text-yellow-500" />
                </div>
                <p className="mt-2 text-3xl font-semibold text-gray-900">{usersData.active}</p>
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                  <span>3% from last period</span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-500">Resolution Rate</h3>
                  <ChartBarIcon className="h-5 w-5 text-purple-500" />
                </div>
                <p className="mt-2 text-3xl font-semibold text-gray-900">80%</p>
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                  <span>5% from last period</span>
                </div>
              </div>
            </div>

            {/* Overview Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Combined Activity */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Combined Activity</h3>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <p className="text-gray-500">Chart will be implemented here</p>
                </div>
              </div>

              {/* Status Overview */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Status Overview</h3>
                <div className="space-y-4">
                  {issuesData.byStatus.map((item, index) => (
                    <div key={index}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">{item.status}</span>
                        <span className="text-sm text-gray-500">{item.count} issues</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${item.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
          onClick={handleExportCancel}
        >
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">Export Report</h2>
            <div className="space-x-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleExportConfirm('PDF');
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Export as PDF
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleExportConfirm('CSV');
                }}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                Export as CSV
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports; 