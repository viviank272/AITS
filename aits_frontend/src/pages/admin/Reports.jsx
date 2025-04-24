import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
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
import { getIssueReports, getUserReports, getOverviewReports } from '../../services/api';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

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
    const fetchReportData = async () => {
      setLoading(true);
      try {
        if (reportType === 'overview') {
          const data = await getOverviewReports(dateRange);
          processReportData(data.issueData, data.userData);
        } else if (reportType === 'issues') {
          const data = await getIssueReports(dateRange);
          processIssueData(data);
        } else if (reportType === 'users') {
          const data = await getUserReports(dateRange);
          processUserData(data);
        }
      } catch (error) {
        console.error('Error fetching report data:', error);
        // Fallback to mock data if API call fails
        fallbackToMockData();
      } finally {
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
      }
    };

    fetchReportData();
  }, [location, dateRange, reportType]);

  const processIssueData = (data) => {
    // If API returns formatted data, use it directly
    if (data && typeof data === 'object' && data.total !== undefined) {
      setIssuesData(data);
      return;
    }

    // Otherwise, process the raw data
    if (Array.isArray(data)) {
      const total = data.length;
      const resolved = data.filter(issue => issue.status?.name?.toLowerCase() === 'resolved').length;
      const pending = total - resolved;
      
      // Calculate average resolution time
      let totalResolutionTime = 0;
      let resolvedIssuesCount = 0;
      
      data.forEach(issue => {
        if (issue.resolved_at && issue.created_at) {
          const createdDate = new Date(issue.created_at);
          const resolvedDate = new Date(issue.resolved_at);
          const resolutionTime = (resolvedDate - createdDate) / (1000 * 60 * 60 * 24); // in days
          totalResolutionTime += resolutionTime;
          resolvedIssuesCount++;
        }
      });
      
      const averageResolutionTime = resolvedIssuesCount > 0 
        ? (totalResolutionTime / resolvedIssuesCount).toFixed(1) 
        : 0;
      
      // Process trends data (number of issues per day)
      const trendMap = {};
      data.forEach(issue => {
        const date = new Date(issue.created_at).toISOString().split('T')[0];
        trendMap[date] = (trendMap[date] || 0) + 1;
      });
      
      const sortedDates = Object.keys(trendMap).sort();
      const trends = sortedDates.map(date => ({ date, count: trendMap[date] }));
      
      // Process category distribution
      const categoryMap = {};
      data.forEach(issue => {
        const category = issue.category?.name || 'Uncategorized';
        categoryMap[category] = (categoryMap[category] || 0) + 1;
      });
      
      const byCategory = Object.entries(categoryMap).map(([category, count]) => ({
        category,
        count,
        percentage: Math.round((count / total) * 100) || 0
      }));
      
      // Process status distribution
      const statusMap = {};
      data.forEach(issue => {
        const status = issue.status?.name || 'Unknown';
        statusMap[status] = (statusMap[status] || 0) + 1;
      });
      
      const byStatus = Object.entries(statusMap).map(([status, count]) => ({
        status,
        count,
        percentage: Math.round((count / total) * 100) || 0
      }));
      
      setIssuesData({
        total,
        resolved,
        pending,
        averageResolutionTime,
        trends,
        byCategory,
        byStatus
      });
    }
  };

  const processUserData = (data) => {
    // If API returns formatted data, use it directly
    if (data && typeof data === 'object' && data.total !== undefined) {
      setUsersData(data);
      return;
    }

    // Otherwise, process the raw data
    if (Array.isArray(data)) {
      const total = data.length;
      const active = data.filter(user => user.is_active).length;
      
      // Get users created in the last X days based on dateRange
      const now = new Date();
      let daysAgo;
      switch (dateRange) {
        case 'week': daysAgo = 7; break;
        case 'month': daysAgo = 30; break;
        case 'quarter': daysAgo = 90; break;
        case 'year': daysAgo = 365; break;
        default: daysAgo = 7;
      }
      
      const dateThreshold = new Date(now.setDate(now.getDate() - daysAgo));
      const newUsers = data.filter(user => new Date(user.date_joined) >= dateThreshold).length;
      
      // Process role distribution
      const roleMap = {};
      data.forEach(user => {
        let role;
        if (user.user_type === 'student') role = 'Students';
        else if (user.college) role = 'Colleges';
        else if (user.user_type === 'staff' || user.is_staff) role = 'Staff';
        else role = 'Other';
        
        roleMap[role] = (roleMap[role] || 0) + 1;
      });
      
      const byRole = Object.entries(roleMap).map(([role, count]) => ({
        role,
        count,
        percentage: Math.round((count / total) * 100) || 0
      }));
      
      // Generate user activity data based on creation dates
      // This is a proxy for real login activity which would require additional tracking
      const activityMap = {};
      const pastDate = new Date();
      pastDate.setDate(now.getDate() - 7);
      
      // Create array of dates for the selected period
      const dates = [];
      const currentDate = new Date(pastDate);
      while (currentDate <= now) {
        dates.push(currentDate.toISOString().split('T')[0]);
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      // Count users that existed on each date
      dates.forEach(date => {
        const activeUsersCount = data.filter(user => 
          new Date(user.date_joined) <= new Date(date) && user.is_active
        ).length;
        activityMap[date] = activeUsersCount;
      });
      
      const activity = Object.entries(activityMap).map(([date, active]) => ({ date, active }));
      
      setUsersData({
        total,
        active,
        new: newUsers,
        byRole,
        activity
      });
    }
  };

  const processReportData = (issueData, userData) => {
    processIssueData(issueData);
    processUserData(userData);
  };

  const fallbackToMockData = () => {
    // Generate a series of consecutive dates
    const today = new Date();
    const trendDates = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      trendDates.push(date.toISOString().split('T')[0]);
    }

    setIssuesData({
      total: 150,
      resolved: 120,
      pending: 30,
      averageResolutionTime: 2.5,
      trends: [
        { date: trendDates[0], count: 10 },
        { date: trendDates[1], count: 15 },
        { date: trendDates[2], count: 8 },
        { date: trendDates[3], count: 20 },
        { date: trendDates[4], count: 12 },
        { date: trendDates[5], count: 18 },
        { date: trendDates[6], count: 14 }
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
        { role: 'Colleges', count: 400, percentage: 16 },
        { role: 'Staff', count: 258, percentage: 11 }
      ],
      activity: [
        { date: trendDates[0], active: 1800 },
        { date: trendDates[1], active: 1850 },
        { date: trendDates[2], active: 1900 },
        { date: trendDates[3], active: 1950 },
        { date: trendDates[4], active: 2000 },
        { date: trendDates[5], active: 2050 },
        { date: trendDates[6], active: 2150 }
      ]
    });
  };

  const handleDateRangeChange = (e) => {
    setDateRange(e.target.value);
  };

  const handleReportTypeChange = (type) => {
    setReportType(type);
  };

  const handleExport = () => {
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

  // User activity chart options
  const getUserActivityChartData = () => {
    return {
      labels: usersData.activity.map(item => {
        const date = new Date(item.date);
        return `${date.getMonth()+1}/${date.getDate()}`;
      }),
      datasets: [
        {
          label: 'Active Users',
          data: usersData.activity.map(item => item.active),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: 'rgb(59, 130, 246)',
          pointRadius: 4,
          pointHoverRadius: 6,
        }
      ]
    };
  };

  // Issue trends chart data
  const getIssueTrendsChartData = () => {
    return {
      labels: issuesData.trends.map(item => {
        const date = new Date(item.date);
        return `${date.getMonth()+1}/${date.getDate()}`;
      }),
      datasets: [
        {
          label: 'New Issues',
          data: issuesData.trends.map(item => item.count),
          borderColor: 'rgb(234, 88, 12)',
          backgroundColor: 'rgba(234, 88, 12, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: 'rgb(234, 88, 12)',
          pointRadius: 4,
          pointHoverRadius: 6,
        }
      ]
    };
  };

  // Combined activity chart data
  const getCombinedActivityChartData = () => {
    // Create a date range that includes all dates from both datasets
    const userDates = usersData.activity.map(item => item.date);
    const issueDates = issuesData.trends.map(item => item.date);
    const allDates = [...new Set([...userDates, ...issueDates])].sort();
    
    // Create a map for quick lookup of user activity and issue counts by date
    const userActivityMap = new Map(usersData.activity.map(item => [item.date, item.active]));
    const issueCountMap = new Map(issuesData.trends.map(item => [item.date, item.count]));
    
    return {
      labels: allDates.map(date => {
        const dateObj = new Date(date);
        return `${dateObj.getMonth()+1}/${dateObj.getDate()}`;
      }),
      datasets: [
        {
          label: 'Active Users',
          data: allDates.map(date => userActivityMap.get(date) || null),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0)',
          borderWidth: 2,
          tension: 0.4,
          pointBackgroundColor: 'rgb(59, 130, 246)',
          pointRadius: 4,
          pointHoverRadius: 6,
          yAxisID: 'y',
        },
        {
          label: 'New Issues',
          data: allDates.map(date => issueCountMap.get(date) || null),
          borderColor: 'rgb(234, 88, 12)',
          backgroundColor: 'rgba(234, 88, 12, 0)',
          borderWidth: 2,
          tension: 0.4,
          pointBackgroundColor: 'rgb(234, 88, 12)',
          pointRadius: 4,
          pointHoverRadius: 6,
          yAxisID: 'y1',
        }
      ]
    };
  };

  // Combined chart options
  const combinedChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 10,
        titleFont: {
          size: 14,
        },
        bodyFont: {
          size: 14,
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
        }
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        beginAtZero: false,
        grid: {
          borderDash: [2, 4],
          color: '#e5e7eb',
        },
        title: {
          display: true,
          text: 'Active Users'
        },
        ticks: {
          callback: function(value) {
            if (value >= 1000) {
              return (value / 1000) + 'k';
            }
            return value;
          }
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        beginAtZero: true,
        grid: {
          display: false,
        },
        title: {
          display: true,
          text: 'New Issues'
        }
      }
    }
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 10,
        titleFont: {
          size: 14,
        },
        bodyFont: {
          size: 14,
        },
        callbacks: {
          title: (context) => {
            const index = context[0].dataIndex;
            return usersData.activity[index]?.date || '';
          },
          label: (context) => {
            return `Active Users: ${context.formattedValue}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: false,
        grid: {
          borderDash: [2, 4],
          color: '#e5e7eb',
        },
        ticks: {
          callback: function(value) {
            if (value >= 1000) {
              return (value / 1000) + 'k';
            }
            return value;
          }
        }
      }
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
                <div className="h-64 bg-gray-50 rounded-lg">
                  <Line data={getIssueTrendsChartData()} options={chartOptions} />
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
                <div className="h-64 bg-gray-50 rounded-lg">
                  <Line data={getUserActivityChartData()} options={chartOptions} />
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
                <div className="h-64 bg-gray-50 rounded-lg">
                  <Line data={getCombinedActivityChartData()} options={combinedChartOptions} />
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