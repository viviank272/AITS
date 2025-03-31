import React from 'react';
import { useNavigate } from 'react-router-dom';
import logoWhite from '../assets/logo-white.png';
import {
  UserGroupIcon,
  AcademicCapIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';

const Landing = () => {
  const navigate = useNavigate();

  const handleRoleSelect = (role) => {
    // Store the selected role in localStorage
    localStorage.setItem('selectedRole', role);
    // Navigate to login page
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1E9833]">
      <div className="max-w-4xl w-full mx-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Logo and Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center">
              <img
                src={logoWhite}
                alt="University Logo" 
                className="h-32 w-auto object-contain"
              />
            </div>
            <div className="mt-4">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Academic Issue Tracker</h1>
              <p className="text-lg text-gray-600">Select your role to continue</p>
            </div>
          </div>

          {/* Role Selection Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Admin Card */}
            <div
              className="bg-white border-2 border-blue-500 rounded-xl p-6 cursor-pointer hover:bg-blue-50 transition-colors"
              onClick={() => handleRoleSelect('admin')}
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShieldCheckIcon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Administrator</h3>
                <p className="text-gray-600">Access system administration and management features</p>
              </div>
            </div>

            {/* Lecturer Card */}
            <div
              className="bg-white border-2 border-green-500 rounded-xl p-6 cursor-pointer hover:bg-green-50 transition-colors"
              onClick={() => handleRoleSelect('lecturer')}
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserGroupIcon className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Lecturer</h3>
                <p className="text-gray-600">Manage and respond to student issues</p>
              </div>
            </div>

            {/* Student Card */}
            <div
              className="bg-white border-2 border-purple-500 rounded-xl p-6 cursor-pointer hover:bg-purple-50 transition-colors"
              onClick={() => handleRoleSelect('student')}
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AcademicCapIcon className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Student</h3>
                <p className="text-gray-600">Submit and track your academic issues</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-gray-500 mt-8">
            <p>© {new Date().getFullYear()} Makerere University. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing; 