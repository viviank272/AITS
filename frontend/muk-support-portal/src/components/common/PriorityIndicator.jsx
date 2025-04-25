import React from 'react';

function PriorityIndicator({ priority }) {
  const getPriorityStyles = () => {
    const priorityLower = priority.toLowerCase();
    
    switch (priorityLower) {
      case 'high':
        return 'priority-dot priority-high';
      case 'medium':
        return 'priority-dot priority-medium';
      case 'low':
        return 'priority-dot priority-low';
      default:
        return 'priority-dot bg-gray-400';
    }
  };

  return (
    <div className="flex items-center">
      <span className={getPriorityStyles()}></span>
      <span>{priority}</span>
    </div>
  );
}

export default PriorityIndicator;