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
  UserCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

const StudentLayout = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const logout = useLogout();
  const [studentProfile, setStudentProfile] = useState(null);
  const [isProfileExpanded, setIsProfileExpanded] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [profileError, setProfileError] = useState(false);
  const [errorStatus, setErrorStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Get program name from profile with fallbacks for different API response formats
  const getProgramName = (profile) => {
    // Check if program is an object with program_name property
    if (profile?.program?.program_name) {
      return profile.program.program_name;
    }
    // Check if program is a string (flat structure)
    if (typeof profile?.program === 'string') {
      return profile.program;
    }
    return 'Program';
  };

  // Get college name from profile with fallbacks for different API response formats
  const getCollegeName = (profile) => {
    // Check if college is an object with college_name property
    if (profile?.college?.college_name) {
      return profile.college.college_name;
    }
    // Check if college_name is directly available
    if (profile?.college_name) {
      return profile.college_name;
    }
    return 'College';
  };

  // Get department name from profile with fallbacks for different API response formats
  const getDepartmentName = (profile) => {
    // Check if department is an object with dept_name property
    if (profile?.department?.dept_name) {
      return profile.department.dept_name;
    }
    // Check if department_name is directly available
    if (profile?.department_name) {
      return profile.department_name;
    }
    return 'Department';
  };

  // Fetch student profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (isLoading) return; // Prevent multiple simultaneous fetches
      
      try {
        setIsLoading(true);
        setProfileError(false);
        setErrorStatus(null);
        
        const token = localStorage.getItem('access');
        
        if (!token) {
          console.error('No access token found');
          setProfileError(true);
          setErrorStatus('auth');
          return;
        }
        
        const profileData = await getUserProfile();
        console.log('Student profile data:', profileData);
        
        if (profileData) {
          setStudentProfile(profileData);
          // Reset retry count on success
          setRetryCount(0);
        } else {
          console.error('No profile data returned');
          setProfileError(true);
          setErrorStatus('empty');
        }
      } catch (error) {
        console.error('Error fetching student profile:', error);
        setProfileError(true);
        
        // Set specific error status based on the error
        if (error.response?.status === 500) {
          setErrorStatus('server');
        } else if (error.response?.status === 401 || error.response?.status === 403) {
          setErrorStatus('auth');
        } else if (error.code === 'ERR_NETWORK') {
          setErrorStatus('network');
        } else {
          setErrorStatus('unknown');
        }
        
        // Retry logic - try up to 3 times with increasing delay
        if (retryCount < 3) {
          const retryDelay = Math.pow(2, retryCount) * 1000; // Exponential backoff
          console.log(`Retrying profile fetch in ${retryDelay}ms (attempt ${retryCount + 1})`);
          
          setTimeout(() => {
            setRetryCount(prevCount => prevCount + 1);
          }, retryDelay);
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (user && user.role === 'student') {
      fetchProfile();
    }
  }, [user, retryCount]);

  // Function for manual retry
  const handleManualRetry = () => {
    setRetryCount(prevCount => prevCount + 1);
  };

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

  // Helper function to get error message
  const getErrorMessage = () => {
    switch (errorStatus) {
      case 'server':
        return 'Server error. Please try again later or contact support.';
      case 'auth':
        return 'Authentication error. Please log out and log in again.';
      case 'network':
        return 'Network connection issue. Check your internet connection.';
      case 'empty':
        return 'No profile data found. Please update your profile.';
      default:
        return 'Unable to load profile data. Please try refreshing.';
    }
  };

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
                <h2 className="font-semibold">{studentProfile?.full_name || user?.full_name || 'Student Name'}</h2>
                <p className="text-sm text-gray-300">#{studentProfile?.student_number || user?.student_number || 'N/A'}</p>
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
                  {profileError && (
                    <div className="text-xs text-amber-400 mb-2 flex justify-between items-center">
                      <span>{getErrorMessage()}</span>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleManualRetry();
                        }}
                        className="text-blue-400 hover:text-blue-300 flex items-center"
                        disabled={isLoading}
                      >
                        <ArrowPathIcon className={`h-3 w-3 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                        <span className="text-xs">{isLoading ? 'Loading...' : 'Retry'}</span>
                      </button>
                    </div>
                  )}
                  <div className="flex items-center space-x-2 group">
                    <AcademicCapIcon className="h-4 w-4 text-gray-400 group-hover:text-blue-400" />
                    <span className="text-sm text-gray-300 group-hover:text-white">{getProgramName(studentProfile)}</span>
                  </div>
                  <div className="flex items-center space-x-2 group">
                    <BuildingLibraryIcon className="h-4 w-4 text-gray-400 group-hover:text-blue-400" />
                    <span className="text-sm text-gray-300 group-hover:text-white">{getCollegeName(studentProfile)}</span>
                  </div>
                  <div className="flex items-center space-x-2 group">
                    <BuildingOfficeIcon className="h-4 w-4 text-gray-400 group-hover:text-blue-400" />
                    <span className="text-sm text-gray-300 group-hover:text-white">{getDepartmentName(studentProfile)}</span>
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