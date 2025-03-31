import React, { useContext } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'
import {
  HomeIcon,
  TicketIcon,
  ClipboardDocumentListIcon,
  ChatBubbleLeftRightIcon,
  BellIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ArrowLeftOnRectangleIcon
} from '@heroicons/react/24/outline'

const LecturerSidebar = () => {
  const { user } = useContext(AuthContext)
  const location = useLocation()

  const navigation = [
    { name: 'Dashboard', href: '/lecturer', icon: HomeIcon },
    { name: 'Assigned Issues', href: '/lecturer/assigned', icon: TicketIcon },
    { name: 'Department Issues', href: '/lecturer/department', icon: ClipboardDocumentListIcon },
    { name: 'Messages', href: '/lecturer/messages', icon: ChatBubbleLeftRightIcon },
    { name: 'Notifications', href: '/lecturer/notifications', icon: BellIcon },
    { name: 'Reports', href: '/lecturer/reports', icon: ChartBarIcon },
    { name: 'Settings', href: '/lecturer/settings', icon: Cog6ToothIcon },
    { name: 'Logout', href: '/logout', icon: ArrowLeftOnRectangleIcon }
  ]

  return (
    <div className="flex flex-col w-64 bg-[#1e2a3b] text-white">
      {/* Lecturer Info */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-xl font-semibold">
            {user?.name?.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <h2 className="font-semibold">{user?.name || 'Dr. Patricia Lee'}</h2>
            <p className="text-sm text-gray-300">{user?.department || 'Computer Science'}</p>
          </div>
        </div>
        <div className="mt-4 text-sm text-gray-300">
          Faculty ID: {user?.facultyId || 'F9876543'}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center px-6 py-3 text-sm ${
                isActive 
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-[#2a3a4f] hover:text-white'
              }`}
            >
              <item.icon
                className={`mr-3 h-5 w-5 ${
                  isActive
                    ? 'text-white'
                    : 'text-gray-400 group-hover:text-white'
                }`}
              />
              {item.name}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

export default LecturerSidebar