import React from 'react';

function StatusBadge({ status }) {
  const getStatusStyles = () => {
    const statusLower = status.toLowerCase();
    
    switch (statusLower) {
      case 'active':
        return 'bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium';
      case 'inactive':
        return 'bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-medium';
      case 'open':
        return 'bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium';
      case 'in progress':
        return 'bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-medium';
      case 'resolved':
        return 'bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium';
      case 'closed':
        return 'bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium';
      case 'reopened':
        return 'bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-medium';
      default:
        return 'bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium';
    }
  };

  return (
    <span className={getStatusStyles()}>
      {status}
    </span>
  );
}

export default StatusBadge;