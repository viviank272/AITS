import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCog,
  faDownload, 
  faSearch, 
  faUserPlus, 
  faEdit, 
  faKey, 
  faBan, 
  faCheckCircle,
  faFilter
} from '@fortawesome/free-solid-svg-icons';
import StatusBadge from '../common/StatusBadge';
import CollegePerformance from './CollegePerformance';

const AdminDashboard = () => {
  const [collegeData, setCollegeData] = React.useState({
    selectedCollege: 'All Colleges',
    colleges: [
      { name: 'College of Engineering', issues: '31', sla: '94%', response: '4.2hrs' },
      { name: 'College of Science', issues: '27', sla: '89%', response: '5.6hrs' },
      { name: 'College of Business', issues: '42', sla: '78%', response: '8.1hrs' },
      { name: 'College of Arts', issues: '19', sla: '91%', response: '6.2hrs' }
    ],
    allColleges: ['All Colleges', 'Engineering', 'Science', 'Business', 'Arts', 'Medicine']
  });
  
  const [activityLog, setActivityLog] = React.useState({
    filter: 'All Activities',
    activities: [
      { 
        id: 'act1',
        action: 'User Added', 
        icon: faUserPlus,
        color: '#3498db',
        description: 'New lecturer account created for Engineering department',
        user: 'Admin Registrar',
        datetime: 'Today, 10:45 AM',
        ip: '192.168.1.105'
      },
      { 
        id: 'act2',
        action: 'Role Modified', 
        icon: faEdit,
        color: '#f39c12',
        description: 'Updated permissions for Department Head role',
        user: 'Admin Registrar',
        datetime: 'Today, 09:32 AM',
        ip: '192.168.1.105'
      },
      { 
        id: 'act3',
        action: 'SLA Breach', 
        icon: faBan,
        color: '#e74c3c',
        description: 'Issue ISS-2014 exceeded resolution timeframe',
        user: 'System',
        datetime: 'Today, 09:00 AM',
        ip: 'System'
      },
      { 
        id: 'act4',
        action: 'Category Added', 
        icon: faCheckCircle,
        color: '#27ae60',
        description: 'New category "Internship Issues" created for Business college',
        user: 'Dean Roberts',
        datetime: 'Yesterday, 4:15 PM',
        ip: '192.168.1.87'
      },
      {
        id: 'act5',
        action: 'System Update',
        icon: faCog,
        color: '#9b59b6',
        description: 'Email notification system maintenance completed',
        user: 'System Admin',
        datetime: 'Yesterday, 2:30 PM',
        ip: '192.168.1.42'
      }
    ],
    filterOptions: ['All Activities', 'User Management', 'Issues', 'System Changes']
  });
  
  const [userManagement, setUserManagement] = React.useState({
    users: [
      { 
        id: 'F9876543', 
        name: 'Dr. Peter Wakholi', 
        role: 'Lecturer', 
        department: 'Computer Science',
        status: 'Active',
        lastLogin: 'Today, 9:30 AM'
      },
      { 
        id: 'S12345678', 
        name: 'John Smith', 
        role: 'Student', 
        department: 'Computer Science',
        status: 'Active',
        lastLogin: 'Today, 10:15 AM'
      },
      { 
        id: 'F8765432', 
        name: 'Prof. Michael Johnson', 
        role: 'Department Head', 
        department: 'Business Administration',
        status: 'Active',
        lastLogin: 'Yesterday, 4:20 PM'
      },
      { 
        id: 'F7654321', 
        name: 'Dr. Sarah Williams', 
        role: 'Dean', 
        department: 'College of Science',
        status: 'Active',
        lastLogin: 'Yesterday, 2:45 PM'
      },
      { 
        id: 'S23456789', 
        name: 'Emily Chen', 
        role: 'Student', 
        department: 'Electrical Engineering',
        status: 'Inactive',
        lastLogin: '3 months ago'
      }
    ],
    pagination: {
      currentPage: 1,
      totalPages: 5
    },
    searchQuery: ''
  });
  
  const handleSearchChange = (e) => {
    setUserManagement(prev => ({
      ...prev,
      searchQuery: e.target.value
    }));
  };
  
  const handleActivityFilterChange = (filter) => {
    setActivityLog(prev => ({
      ...prev,
      filter
    }));
  };
  
  const handleCollegeSelect = (college) => {
    setCollegeData(prev => ({
      ...prev,
      selectedCollege: college
    }));
  };
  
  const handleEditUser = (user) => {
    alert(`Editing user: ${user.name}`);
  };
  
  const handleResetPassword = (user) => {
    alert(`Resetting password for user: ${user.name}`);
  };
  
  const handleToggleUserStatus = (user) => {
    alert(`Toggling status for user: ${user.name}`);
  };

  const handleAddUserClick = () => {
    alert('Opening add user form');
  };
  
  return (
    <div className="p-8">
      {/* Dashboard Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-[#1e1e77]">Admin Dashboard</h1>
        <div className="flex items-center gap-4">
          <div className="relative w-[400px]">
          <input 
            type="text" 
            placeholder="Search users, issues, departments..." 
              className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm"
              onChange={handleSearchChange}
            value={userManagement.searchQuery}
            />
            <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#1e1e77] text-white rounded-lg text-sm">
            <FontAwesomeIcon icon={faCog} />
            Settings
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-[#1e1e77] text-[#1e1e77] rounded-lg text-sm">
            <FontAwesomeIcon icon={faDownload} />
            Reports
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-5 gap-6 mb-8">
        {/* Total Users */}
        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-blue-500">
          <h3 className="text-sm font-medium text-gray-500 uppercase mb-4">TOTAL USERS</h3>
          <div className="text-3xl font-bold mb-2">2,458</div>
          <div className="text-sm text-gray-500">1,245 students, 213 faculty/staff</div>
        </div>

        {/* Active Issues */}
        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-green-500">
          <h3 className="text-sm font-medium text-gray-500 uppercase mb-4">ACTIVE ISSUES</h3>
          <div className="text-3xl font-bold mb-2">125</div>
          <div className="text-sm text-gray-500">85% within SLA timeframe</div>
        </div>

        {/* Unassigned Issues */}
        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-orange-500">
          <h3 className="text-sm font-medium text-gray-500 uppercase mb-4">UNASSIGNED ISSUES</h3>
          <div className="text-3xl font-bold mb-2">18</div>
          <div className="text-sm text-gray-500">7 high priority issues</div>
        </div>

        {/* SLA Breaches */}
        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-red-500">
          <h3 className="text-sm font-medium text-gray-500 uppercase mb-4">SLA BREACHES</h3>
          <div className="text-3xl font-bold mb-2">12</div>
          <div className="text-sm text-gray-500">4 critical breaches</div>
        </div>
        
        {/* Departments */}
        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-purple-500">
          <h3 className="text-sm font-medium text-gray-500 uppercase mb-4">DEPARTMENTS</h3>
          <div className="text-3xl font-bold mb-2">24</div>
          <div className="text-sm text-gray-500">Across 5 colleges</div>
        </div>
      </div>

      {/* System Overview and Status */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        {/* System Overview */}
        <div className="col-span-2 bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-[#1e1e77]">System Overview</h2>
            <select className="px-4 py-2 border rounded-lg text-sm">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 90 days</option>
            </select>
          </div>
          <div className="h-[300px] bg-gray-50 rounded flex items-center justify-center text-gray-500">
            Issue Trend Graph - 7 Day Overview
          </div>
          <div className="flex mt-4 border-t pt-4">
            <button className="text-[#1e1e77] font-medium px-4 py-2 border-b-2 border-[#1e1e77]">
              Issues by Status
            </button>
            <button className="text-gray-500 px-4 py-2">
              Issues by College
            </button>
            <button className="text-gray-500 px-4 py-2">
              Issues by Category
            </button>
          </div>
          </div>
          
        {/* System Status */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-[#1e1e77]">System Status</h2>
            <span className="text-green-500 text-sm">All Systems Operational</span>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span>Issue Tracking System</span>
              </div>
              <span className="text-green-500 text-sm">Operational</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span>User Authentication</span>
              </div>
              <span className="text-green-500 text-sm">Operational</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                <span>Email Notifications</span>
              </div>
              <span className="text-orange-500 text-sm">Minor Issues</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span>File Storage</span>
              </div>
              <span className="text-green-500 text-sm">Operational</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span>Database System</span>
              </div>
              <span className="text-green-500 text-sm">Operational</span>
        </div>
          </div>
          <div className="mt-6 pt-6 border-t">
            <h3 className="font-medium mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-4">
              <Link 
                to="/admin/users?action=add"
                className="p-4 text-center bg-gray-50 rounded-lg hover:bg-gray-100 flex flex-col items-center"
              >
                <FontAwesomeIcon icon={faUserPlus} className="text-xl text-[#1e1e77] mb-2" />
                <div className="text-sm font-medium">Add User</div>
              </Link>
              <Link 
                to="/admin/colleges?action=add"
                className="p-4 text-center bg-gray-50 rounded-lg hover:bg-gray-100 flex flex-col items-center"
              >
                <FontAwesomeIcon icon={faCog} className="text-xl text-[#1e1e77] mb-2" />
                <div className="text-sm font-medium">Add Department</div>
              </Link>
              <Link 
                to="/admin/categories?action=manage"
                className="p-4 text-center bg-gray-50 rounded-lg hover:bg-gray-100 flex flex-col items-center"
              >
                <FontAwesomeIcon icon={faFilter} className="text-xl text-[#1e1e77] mb-2" />
                <div className="text-sm font-medium">Manage Categories</div>
              </Link>
              <Link 
                to="/admin/reports?action=export"
                className="p-4 text-center bg-gray-50 rounded-lg hover:bg-gray-100 flex flex-col items-center"
              >
                <FontAwesomeIcon icon={faDownload} className="text-xl text-[#1e1e77] mb-2" />
                <div className="text-sm font-medium">Export Data</div>
              </Link>
            </div>
          </div>
        </div>
        </div>
        
      {/* College Performance */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">College Performance Overview</h2>
      <CollegePerformance 
          data={collegeData}
        onCollegeSelect={handleCollegeSelect}
      />
      </div>

      {/* Activity Log */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Recent Activity</h2>
          <select 
            value={activityLog.filter}
            onChange={(e) => handleActivityFilterChange(e.target.value)}
            className="px-4 py-2 border rounded-lg text-sm"
          >
            {activityLog.filterOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
        <div className="bg-white rounded-lg shadow">
          {activityLog.activities.map(activity => (
            <div key={activity.id} className="p-4 border-b last:border-b-0">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: activity.color + '20' }}>
                    <FontAwesomeIcon icon={activity.icon} className="text-sm" style={{ color: activity.color }} />
                  </div>
                </div>
                <div className="ml-4 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium">{activity.action}</h3>
                    <span className="text-xs text-gray-500">{activity.datetime}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                  <div className="mt-2 text-xs text-gray-500">
                    <span>By: {activity.user}</span>
                    <span className="mx-2">•</span>
                    <span>IP: {activity.ip}</span>
                  </div>
          </div>
              </div>
            </div>
          ))}
        </div>
        </div>
        
      {/* User Management */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">User Management</h2>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search users..."
                value={userManagement.searchQuery}
                onChange={handleSearchChange}
                className="pl-10 pr-4 py-2 border rounded-lg text-sm w-64"
              />
              <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            <Link 
              to="/admin/users?action=add"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
            >
              Add User
            </Link>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {userManagement.users.map(user => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.role}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.department}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={user.status.toLowerCase()} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.lastLogin}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEditUser(user)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button
                      onClick={() => handleResetPassword(user)}
                      className="text-yellow-600 hover:text-yellow-900 mr-4"
                    >
                      <FontAwesomeIcon icon={faKey} />
                    </button>
                    <button
                      onClick={() => handleToggleUserStatus(user)}
                      className={`${user.status === 'Active' ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                    >
                      <FontAwesomeIcon icon={user.status === 'Active' ? faBan : faCheckCircle} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
            </div>
          </div>
    </div>
  );
};

export default AdminDashboard;