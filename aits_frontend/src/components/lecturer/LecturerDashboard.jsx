import React from 'react';
import { Link } from 'react-router-dom';
import { PlusIcon } from '@heroicons/react/24/outline';

const LecturerDashboard = () => {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Lecturer Dashboard</h1>
        <Link
          to="issues/create"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Create New Issue
        </Link>
      </div>
      
      {/* Rest of your dashboard content */}
      <div className="grid grid-cols-1 gap-6">
        {/* Add your dashboard sections here */}
      </div>
    </div>
  );
};

export default LecturerDashboard;