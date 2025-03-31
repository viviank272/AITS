import React from 'react'
import { Outlet } from 'react-router-dom'
import { Link, useLocation } from 'react-router-dom'
import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'
import useLogout from '../hooks/useLogout'
import {
  HomeIcon,
  UserGroupIcon,
  BuildingLibraryIcon,
  AcademicCapIcon,
  UsersIcon,
  DocumentTextIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ClipboardDocumentListIcon,
  ArrowLeftOnRectangleIcon
} from '@heroicons/react/24/outline'

const AdminLayout = () => {
  const { user } = useContext(AuthContext)
  const location = useLocation()
  const logout = useLogout()

  const handleLogout = (e) => {
    e.preventDefault()
    logout()
  }

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: HomeIcon },
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
    { name: 'Categories', href: '/admin/categories', icon: ClipboardDocumentListIcon },
    { name: 'Reports & Analytics', href: '/admin/reports', icon: ChartBarIcon },
    {
      name: 'SYSTEM',
      type: 'header'
    },
    { name: 'System Settings', href: '/admin/settings', icon: Cog6ToothIcon },
    { name: 'Roles & Permissions', href: '/admin/roles', icon: UserGroupIcon },
    { name: 'Audit Logs', href: '/admin/audit-logs', icon: DocumentTextIcon }
  ]

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {/* Fixed Sidebar */}
      <div className="fixed inset-y-0 flex w-64 flex-col">
        {/* Sidebar component */}
        <div className="flex min-h-0 flex-1 flex-col bg-[#1e1e77]">
          {/* User info */}
          <div className="flex flex-shrink-0 flex-col items-start p-4 text-white">
            <div className="flex items-center space-x-3">
              <div className="h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center text-xl font-bold">
                {user?.name?.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <h2 className="text-base font-semibold">{user?.name || 'Admin User'}</h2>
                <p className="text-sm text-gray-300">{user?.role || 'System Administrator'}</p>
              </div>
            </div>
            <span className="mt-2 text-sm text-gray-300">ID: {user?.adminId || 'A0012345'}</span>
          </div>

          {/* Navigation */}
          <div className="flex flex-1 flex-col overflow-y-auto">
            <nav className="flex-1 space-y-1 px-2 py-4">
              {navigation.map((item) => {
                if (item.type === 'header') {
                  return (
                    <h3 key={item.name} className="px-3 mt-4 mb-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      {item.name}
                    </h3>
                  )
                }

                const isActive = location.pathname === item.href

                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      isActive
                        ? 'bg-[#2e2ea7] text-white'
                        : 'text-gray-300 hover:bg-[#2e2ea7] hover:text-white'
                    }`}
                  >
                    <item.icon
                      className={`mr-3 h-5 w-5 flex-shrink-0 ${
                        isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'
                      }`}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                )
              })}
              
              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-3 py-2 mt-4 text-sm font-medium rounded-md text-gray-300 hover:bg-[#2e2ea7] hover:text-white"
              >
                <ArrowLeftOnRectangleIcon
                  className="mr-3 h-5 w-5 flex-shrink-0 text-gray-400"
                  aria-hidden="true"
                />
                Logout
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col pl-64">
        <main className="flex-1 overflow-y-auto bg-gray-100">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout