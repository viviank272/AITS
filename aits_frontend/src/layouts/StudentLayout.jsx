import React, { useContext, useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { IssuesProvider } from '../context/IssuesContext';
import useLogout from '../hooks/useLogout';
import { getUserProfile } from '../services/api';
import {
  HomeIcon,
  TicketIcon,
  BellIcon,
  Cog6ToothIcon,
  ArrowLeftOnRectangleIcon,
  AcademicCapIcon,
  BuildingLibraryIcon,
  BuildingOfficeIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';

const StudentLayout = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const logout = useLogout();
  const [studentProfile, setStudentProfile] = useState(null);
  const [isProfileExpanded, setIsProfileExpanded] = useState(false);

  // Fetch student profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profileData = await getUserProfile();
        setStudentProfile(profileData);
      } catch (error) {
        console.error('Error fetching student profile:', error);
      }
    };

    if (user && user.role === 'student') {
      fetchProfile();
    }
  }, [user]);

  // Don't render anything if not authenticated
  if (!user || user.role !== 'student') {
    return null;
  }

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
            <div 
              className="flex items-center space-x-4 cursor-pointer"
              onClick={() => setIsProfileExpanded(!isProfileExpanded)}
            >
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-xl font-semibold relative">
                <UserCircleIcon className="h-8 w-8 text-white" />
                <div className="absolute bottom-0 right-0 bg-green-500 rounded-full p-1">
                  <div className="h-2 w-2 rounded-full bg-white"></div>
                </div>
              </div>
              <div className="flex-1">
                <h2 className="font-semibold">{studentProfile?.full_name || 'Student Name'}</h2>
                <p className="text-sm text-gray-300">#{studentProfile?.student_number || 'N/A'}</p>
              </div>
              <button className="text-gray-400 hover:text-white">
                {isProfileExpanded ? (
                  <ChevronUpIcon className="h-5 w-5" />
                ) : (
                  <ChevronDownIcon className="h-5 w-5" />
                )}
              </button>
            </div>
            
            {isProfileExpanded && (
              <div className="mt-4 animate-fade-in">
                <div className="bg-[#2a3a4f] rounded-lg p-3 space-y-2">
                  <div className="flex items-center space-x-2 group">
                    <AcademicCapIcon className="h-4 w-4 text-gray-400 group-hover:text-blue-400" />
                    <span className="text-sm text-gray-300 group-hover:text-white">{studentProfile?.program || 'Program'}</span>
                  </div>
                  <div className="flex items-center space-x-2 group">
                    <BuildingLibraryIcon className="h-4 w-4 text-gray-400 group-hover:text-blue-400" />
                    <span className="text-sm text-gray-300 group-hover:text-white">{studentProfile?.college_name || 'College'}</span>
                  </div>
                  <div className="flex items-center space-x-2 group">
                    <BuildingOfficeIcon className="h-4 w-4 text-gray-400 group-hover:text-blue-400" />
                    <span className="text-sm text-gray-300 group-hover:text-white">{studentProfile?.department_name || 'Department'}</span>
                  </div>
                </div>
              </div>
            )}
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
                onClick={(e) => {
                  e.preventDefault();
                  logout();
                }}
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
          <IssuesProvider>
            <Outlet />
          </IssuesProvider>
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;