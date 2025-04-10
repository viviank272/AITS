import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  DocumentTextIcon,
  UserGroupIcon,
  BuildingLibraryIcon,
  AcademicCapIcon,
  UsersIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ArrowLeftOnRectangleIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeIssues: 0,
    unassignedIssues: 0,
    slaBreaches: 0,
    departments: 0
  });

  const [systemStatus, setSystemStatus] = useState([
    { name: 'Issue Tracking System', status: 'Operational' },
    { name: 'User Authentication', status: 'Operational' },
    { name: 'Email Notifications', status: 'Minor Issues' },
    { name: 'File Storage', status: 'Operational' },
    { name: 'Database System', status: 'Operational' }
  ]);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setStats({
        totalUsers: 2458,
        activeIssues: 125,
        unassignedIssues: 18,
        slaBreaches: 12,
        departments: 24
      });

      setLoading(false);
    }, 1000);
  }, []);

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: DocumentTextIcon },
    { 
      name: 'MANAGEMENT',
      type: 'header'
    },
    { name: 'User Management', href: '/admin/users', icon: UserGroupIcon },
    { name: 'Colleges & Departments', href: '/admin/colleges', icon: BuildingLibraryIcon },
    { name: 'Programs', href: '/admin/programs', icon: AcademicCapIcon },
    { name: 'Students', href: '/admin/students', icon: UsersIcon },
    {
      name: 'ISSUE TRACKING',
      type: 'header'
    },
    { name: 'All Issues', href: '/admin/issues', icon: DocumentTextIcon },
    { name: 'Categories', href: '/admin/categories', icon: ChartBarIcon },
    { name: 'Reports & Analytics', href: '/admin/reports', icon: ChartBarIcon },
    {
      name: 'SYSTEM',
      type: 'header'
    },
    { name: 'System Settings', href: '/admin/settings', icon: Cog6ToothIcon },
    { name: 'Roles & Permissions', href: '/admin/roles', icon: UserGroupIcon },
    { name: 'Audit Logs', href: '/admin/audit-logs', icon: DocumentTextIcon },
    { name: 'Logout', href: '/logout', icon: ArrowLeftOnRectangleIcon }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Side Navigation */}
      <div className="flex flex-col w-64 bg-[#1e1e77] text-white">
        <div className="p-4">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center text-xl font-bold">
              AR
            </div>
            <div>
              <h3 className="font-medium">Admin Registrar</h3>
              <p className="text-sm text-gray-300">System Administrator</p>
            </div>
          </div>
          <p className="text-sm text-gray-300 mt-2">Admin ID: A0012345</p>
        </div>
        
        <nav className="flex-1 px-2 py-4">
          {navigation.map((item) => {
            if (item.type === 'header') {
              return (
                <h3 key={item.name} className="px-3 mt-4 mb-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  {item.name}
                </h3>
              );
            }
            return (
              <Link
                key={item.name}
                to={item.href}
                className="flex items-center px-4 py-2 my-1 text-sm font-medium rounded-md text-gray-300 hover:bg-[#2e2ea7] hover:text-white"
              >
                <item.icon className="mr-3 flex-shrink-0 h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-semibold text-gray-900">Admin Dashboard</h1>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search users, issues, departments..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-96 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button className="px-4 py-2 bg-[#1e1e77] text-white rounded-lg hover:bg-[#2e2ea7] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <Cog6ToothIcon className="h-5 w-5" />
              </button>
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <ChartBarIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-5 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
              <h3 className="text-gray-500 text-sm font-medium uppercase">Total Users</h3>
              <div className="mt-2">
                <p className="text-3xl font-semibold text-gray-900">{stats.totalUsers}</p>
                <p className="text-sm text-gray-500">1,245 students, 213 faculty/staff</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
              <h3 className="text-gray-500 text-sm font-medium uppercase">Active Issues</h3>
              <div className="mt-2">
                <p className="text-3xl font-semibold text-gray-900">{stats.activeIssues}</p>
                <p className="text-sm text-gray-500">85% within SLA timeframe</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border-l-4 border-yellow-500">
              <h3 className="text-gray-500 text-sm font-medium uppercase">Unassigned Issues</h3>
              <div className="mt-2">
                <p className="text-3xl font-semibold text-gray-900">{stats.unassignedIssues}</p>
                <p className="text-sm text-gray-500">7 high priority issues</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border-l-4 border-red-500">
              <h3 className="text-gray-500 text-sm font-medium uppercase">SLA Breaches</h3>
              <div className="mt-2">
                <p className="text-3xl font-semibold text-gray-900">{stats.slaBreaches}</p>
                <p className="text-sm text-gray-500">4 critical breaches</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border-l-4 border-purple-500">
              <h3 className="text-gray-500 text-sm font-medium uppercase">Departments</h3>
              <div className="mt-2">
                <p className="text-3xl font-semibold text-gray-900">{stats.departments}</p>
                <p className="text-sm text-gray-500">Across 5 colleges</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-6 mb-8">
            {/* Issues Overview */}
            <div className="col-span-3 bg-white rounded-lg shadow">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex">
                  <button className="border-blue-700 text-blue-700 whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm">
                    Issues by Status
                  </button>
                  <button className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm">
                    Issues by College
                  </button>
                  <button className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm">
                    Issues by Category
                  </button>
                </nav>
              </div>
              <div className="p-6">
                <div className="h-64 flex items-center justify-center text-gray-500">
                  Issues Distribution Chart
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <Link 
                    to="/admin/users?action=add" 
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 flex flex-col items-center justify-center"
                  >
                    <UserGroupIcon className="h-6 w-6 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-700">Add User</span>
                  </Link>
                  <Link 
                    to="/admin/colleges?action=add"
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 flex flex-col items-center justify-center"
                  >
                    <BuildingLibraryIcon className="h-6 w-6 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-700">Add Department</span>
                  </Link>
                  <Link 
                    to="/admin/categories?action=manage"
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 flex flex-col items-center justify-center"
                  >
                    <DocumentTextIcon className="h-6 w-6 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-700">Manage Categories</span>
                  </Link>
                  <Link 
                    to="/admin/reports?action=export"
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 flex flex-col items-center justify-center"
                  >
                    <ChartBarIcon className="h-6 w-6 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-700">Export Data</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* College Performance Overview */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-medium text-gray-900">College Performance Overview</h2>
              <div className="flex space-x-2">
                <button className="px-4 py-2 bg-blue-700 text-white rounded-full text-sm font-medium">
                  All Colleges
                </button>
                <button className="px-4 py-2 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-100">
                  Engineering
                </button>
                <button className="px-4 py-2 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-100">
                  Science
                </button>
                <button className="px-4 py-2 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-100">
                  Business
                </button>
                <button className="px-4 py-2 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-100">
                  Arts
                </button>
                <button className="px-4 py-2 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-100">
                  Medicine
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">College of Engineering</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-3xl font-semibold text-gray-900">31</div>
                    <div className="text-sm text-gray-500">Active Issues</div>
                  </div>
                  <div>
                    <div className="text-3xl font-semibold text-gray-900">94%</div>
                    <div className="text-sm text-gray-500">SLA Compliance</div>
                  </div>
                  <div>
                    <div className="text-3xl font-semibold text-gray-900">4.2hrs</div>
                    <div className="text-sm text-gray-500">Avg Response</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">College of Science</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-3xl font-semibold text-gray-900">27</div>
                    <div className="text-sm text-gray-500">Active Issues</div>
                  </div>
                  <div>
                    <div className="text-3xl font-semibold text-gray-900">89%</div>
                    <div className="text-sm text-gray-500">SLA Compliance</div>
                  </div>
                  <div>
                    <div className="text-3xl font-semibold text-gray-900">5.6hrs</div>
                    <div className="text-sm text-gray-500">Avg Response</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent System Activity */}
          <div className="mb-8">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-lg font-medium text-blue-900">Recent System Activity</h2>
                <select className="text-sm border-gray-300 rounded-md">
                  <option>All Activities</option>
                  <option>User Activities</option>
                  <option>System Updates</option>
                </select>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP Address</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-blue-600">User Added</span>
                      </td>
                      <td className="px-6 py-4">New lecturer account created for Engineering department</td>
                      <td className="px-6 py-4 whitespace-nowrap">Admin Registrar</td>
                      <td className="px-6 py-4 whitespace-nowrap">Today, 10:45 AM</td>
                      <td className="px-6 py-4 whitespace-nowrap">192.168.1.105</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-yellow-600">Role Modified</span>
                      </td>
                      <td className="px-6 py-4">Updated permissions for Department Head role</td>
                      <td className="px-6 py-4 whitespace-nowrap">Admin Registrar</td>
                      <td className="px-6 py-4 whitespace-nowrap">Today, 09:32 AM</td>
                      <td className="px-6 py-4 whitespace-nowrap">192.168.1.105</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-red-600">SLA Breach</span>
                      </td>
                      <td className="px-6 py-4">Issue ISS-2014 exceeded resolution timeframe</td>
                      <td className="px-6 py-4 whitespace-nowrap">System</td>
                      <td className="px-6 py-4 whitespace-nowrap">Today, 09:00 AM</td>
                      <td className="px-6 py-4 whitespace-nowrap">System</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-green-600">Category Added</span>
                      </td>
                      <td className="px-6 py-4">New category "Internship Issues" created for Business college</td>
                      <td className="px-6 py-4 whitespace-nowrap">Dean Roberts</td>
                      <td className="px-6 py-4 whitespace-nowrap">Yesterday, 4:15 PM</td>
                      <td className="px-6 py-4 whitespace-nowrap">192.168.1.87</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-purple-600">System Update</span>
                      </td>
                      <td className="px-6 py-4">Email notification system maintenance completed</td>
                      <td className="px-6 py-4 whitespace-nowrap">System Admin</td>
                      <td className="px-6 py-4 whitespace-nowrap">Yesterday, 2:30 PM</td>
                      <td className="px-6 py-4 whitespace-nowrap">192.168.1.42</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <button className="px-3 py-1 bg-blue-700 text-white rounded-md text-sm">1</button>
                    <button className="px-3 py-1 text-gray-700 hover:bg-gray-100 rounded-md text-sm">2</button>
                    <button className="px-3 py-1 text-gray-700 hover:bg-gray-100 rounded-md text-sm">3</button>
                    <button className="px-3 py-1 text-gray-700 hover:bg-gray-100 rounded-md text-sm">4</button>
                    <button className="px-3 py-1 text-gray-700 hover:bg-gray-100 rounded-md text-sm">5</button>
                    <button className="px-3 py-1 text-gray-700 hover:bg-gray-100 rounded-md text-sm">Next</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* User Management Overview */}
          <div className="mb-8">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-lg font-medium text-blue-900">User Management Overview</h2>
                <Link to="/admin/users?action=add" className="px-4 py-2 bg-blue-700 text-white rounded-lg text-sm font-medium hover:bg-blue-800">
                  Add New User
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department/College</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">F9876543</td>
                      <td className="px-6 py-4 whitespace-nowrap">Dr. Peter Wakholi</td>
                      <td className="px-6 py-4 whitespace-nowrap">Lecturer</td>
                      <td className="px-6 py-4 whitespace-nowrap">Computer Science</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">Active</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">Today, 9:30 AM</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex space-x-2">
                          <button className="text-gray-600 hover:text-blue-600">Edit</button>
                          <button className="text-gray-600 hover:text-yellow-600">Reset</button>
                          <button className="text-gray-600 hover:text-red-600">Disable</button>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">S12345678</td>
                      <td className="px-6 py-4 whitespace-nowrap">John Smith</td>
                      <td className="px-6 py-4 whitespace-nowrap">Student</td>
                      <td className="px-6 py-4 whitespace-nowrap">Computer Science</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">Active</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">Today, 10:15 AM</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex space-x-2">
                          <button className="text-gray-600 hover:text-blue-600">Edit</button>
                          <button className="text-gray-600 hover:text-yellow-600">Reset</button>
                          <button className="text-gray-600 hover:text-red-600">Disable</button>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">F8765432</td>
                      <td className="px-6 py-4 whitespace-nowrap">Prof. Michael Johnson</td>
                      <td className="px-6 py-4 whitespace-nowrap">Department Head</td>
                      <td className="px-6 py-4 whitespace-nowrap">Business Administration</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">Active</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">Yesterday, 4:20 PM</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex space-x-2">
                          <button className="text-gray-600 hover:text-blue-600">Edit</button>
                          <button className="text-gray-600 hover:text-yellow-600">Reset</button>
                          <button className="text-gray-600 hover:text-red-600">Disable</button>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">S23456789</td>
                      <td className="px-6 py-4 whitespace-nowrap">Emily Chen</td>
                      <td className="px-6 py-4 whitespace-nowrap">Student</td>
                      <td className="px-6 py-4 whitespace-nowrap">Electrical Engineering</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">Inactive</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">3 months ago</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex space-x-2">
                          <button className="text-gray-600 hover:text-blue-600">Edit</button>
                          <button className="text-gray-600 hover:text-yellow-600">Reset</button>
                          <button className="text-gray-600 hover:text-green-600">Enable</button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <button className="px-3 py-1 bg-blue-700 text-white rounded-md text-sm">1</button>
                    <button className="px-3 py-1 text-gray-700 hover:bg-gray-100 rounded-md text-sm">2</button>
                    <button className="px-3 py-1 text-gray-700 hover:bg-gray-100 rounded-md text-sm">3</button>
                    <button className="px-3 py-1 text-gray-700 hover:bg-gray-100 rounded-md text-sm">4</button>
                    <button className="px-3 py-1 text-gray-700 hover:bg-gray-100 rounded-md text-sm">5</button>
                    <button className="px-3 py-1 text-gray-700 hover:bg-gray-100 rounded-md text-sm">Next</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard; 