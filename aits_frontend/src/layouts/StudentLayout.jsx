import React, { useContext } from 'react';
import { Outlet } from 'react-router-dom';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import useLogout from '../hooks/useLogout';
import {
  HomeIcon,
  TicketIcon,
  BellIcon,
  Cog6ToothIcon,
  ArrowLeftOnRectangleIcon
} from '@heroicons/react/24/outline';

const StudentLayout = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const logout = useLogout();

  const handleLogout = (e) => {
    e.preventDefault();
    logout();
  };

  const navigation = [
    { name: 'Dashboard', href: '/student', icon: HomeIcon },
    { name: 'My Issues', href: '/student/issues', icon: TicketIcon },
    { name: 'Notifications', href: '/student/notifications', icon: BellIcon },
    { name: 'Settings', href: '/student/settings', icon: Cog6ToothIcon }
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {/* Fixed Sidebar */}
      <div className="fixed inset-y-0 flex w-64 flex-col">
        {/* Sidebar component */}
        <div className="flex min-h-0 flex-1 flex-col bg-[#1e2a3b] text-white">
          {/* Student Info */}
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-xl font-semibold">
                {user?.name?.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <h2 className="font-semibold">{user?.name || 'Student Name'}</h2>
                <p className="text-sm text-gray-300">{user?.program || 'Computer Science'}</p>
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-300">
              Student ID: {user?.studentId || '2100100100'}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto">
            <nav className="flex-1 py-4">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
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
                );
              })}
              
              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-6 py-3 text-sm text-gray-300 hover:bg-[#2a3a4f] hover:text-white"
              >
                <ArrowLeftOnRectangleIcon className="mr-3 h-5 w-5 text-gray-400" />
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
  );
};

export default StudentLayout;