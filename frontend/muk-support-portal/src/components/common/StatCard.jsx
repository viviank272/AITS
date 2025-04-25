import React from 'react';

function StatCard({ title, value, subtitle, color = 'blue' }) {
  const getColorClasses = () => {
    switch (color) {
      case 'blue':
        return 'bg-blue-100 text-blue-600';
      case 'green':
        return 'bg-green-100 text-green-600';
      case 'orange':
        return 'bg-orange-100 text-orange-600';
      case 'purple':
        return 'bg-purple-100 text-purple-600';
      case 'red':
        return 'bg-red-100 text-red-600';
      default:
        return 'bg-blue-100 text-blue-600';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-card p-6">
      <h3 className="text-sm font-medium text-gray-500 mb-2">{title}</h3>
      <p className="text-3xl font-bold mb-2">{value}</p>
      <div className={`text-sm inline-block rounded px-2 py-1 ${getColorClasses()}`}>
        {subtitle}
      </div>
    </div>
  );
}

export default StatCard;