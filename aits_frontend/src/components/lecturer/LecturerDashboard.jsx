import React from 'react';
import { Link } from 'react-router-dom';
import { PlusIcon } from '@heroicons/react/24/outline';

const LecturerDashboard = () => {
  const [issues, setIssues] = useState([
    { id: 1, title: 'Missing Grades', description: 'Grades for CSC101 not posted', status: 'Pending' },
    { id: 2, title: 'Wrong marks', description: 'Marks Allocation is wrong', status: 'Pending' },
  ]);

  const resolveIssue = (id) => {
    setIssues(prev =>
      prev.map(issue =>
        issue.id === id ? { ...issue, status: 'Resolved' } : issue
      )
    );
  };
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
       

       <div className="grid grid-cols-1 gap-6">
        {issues.map(issue => (
          <div key={issue.id} className="border p-4 rounded-lg shadow-sm bg-white">
            <h2 className="text-lg font-semibold">{issue.title}</h2>
            <p className="text-sm text-gray-600">{issue.description}</p>
            <p className="mt-2">
              Status:{' '}
              <span className={`font-bold ${issue.status === 'Resolved' ? 'text-green-600' : 'text-yellow-600'}`}>
                {issue.status}
              </span>
            </p>
            {issue.status !== 'Resolved' && (
              <button
                onClick={() => resolveIssue(issue.id)}
                className="mt-3 px-4 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition"
              >
                Mark as Resolved
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LecturerDashboard;
    