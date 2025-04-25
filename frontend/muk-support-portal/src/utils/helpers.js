/**
 * Utility helper functions for the University Support Portal
 */

/**
 * Format a date to a readable string
 * @param {Date|string} date - Date to format
 * @param {Object} options - Formatting options
 * @param {boolean} options.includeTime - Whether to include the time
 * @param {boolean} options.useRelative - Whether to use relative time (e.g. "2 days ago")
 * @returns {string} Formatted date string
 */
export const formatDate = (date, { includeTime = false, useRelative = false } = {}) => {
    // Handle string dates
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Check for invalid date
    if (!(dateObj instanceof Date) || isNaN(dateObj)) {
      return 'Invalid date';
    }
  
    // For relative time
    if (useRelative) {
      const now = new Date();
      const diffInSeconds = Math.floor((now - dateObj) / 1000);
      
      if (diffInSeconds < 60) {
        return 'Just now';
      }
      
      const diffInMinutes = Math.floor(diffInSeconds / 60);
      if (diffInMinutes < 60) {
        return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
      }
      
      const diffInHours = Math.floor(diffInMinutes / 60);
      if (diffInHours < 24) {
        return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
      }
      
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 7) {
        return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
      }
      
      const diffInWeeks = Math.floor(diffInDays / 7);
      if (diffInWeeks < 4) {
        return `${diffInWeeks} week${diffInWeeks > 1 ? 's' : ''} ago`;
      }
      
      const diffInMonths = Math.floor(diffInDays / 30);
      if (diffInMonths < 12) {
        return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
      }
      
      const diffInYears = Math.floor(diffInDays / 365);
      return `${diffInYears} year${diffInYears > 1 ? 's' : ''} ago`;
    }
    
    // For standard date format
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    };
    
    if (includeTime) {
      options.hour = '2-digit';
      options.minute = '2-digit';
    }
    
    return dateObj.toLocaleDateString('en-US', options);
  };
  
  /**
   * Truncate a string to a specified length
   * @param {string} str - String to truncate
   * @param {number} length - Maximum length
   * @param {string} suffix - Suffix to add when truncated
   * @returns {string} Truncated string
   */
  export const truncateString = (str, length = 50, suffix = '...') => {
    if (!str) return '';
    
    if (str.length <= length) {
      return str;
    }
    
    return str.substring(0, length).trim() + suffix;
  };
  
  /**
   * Format a name to get initials
   * @param {string} name - Full name
   * @param {number} limit - Maximum number of initials
   * @returns {string} Initials
   */
  export const getInitials = (name, limit = 2) => {
    if (!name) return '';
    
    return name
      .split(' ')
      .slice(0, limit)
      .map(part => part[0]?.toUpperCase() || '')
      .join('');
  };
  
  /**
   * Format a number with commas
   * @param {number} num - Number to format
   * @returns {string} Formatted number
   */
  export const formatNumber = (num) => {
    if (num === null || num === undefined || isNaN(num)) {
      return '0';
    }
    
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };
  
  /**
   * Generate a unique ID
   * @returns {string} Unique ID
   */
  export const generateUniqueId = () => {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  };
  
  /**
   * Calculate time remaining before a deadline
   * @param {Date|string} deadline - Deadline date
   * @returns {Object} Time remaining in different units and status
   */
  export const calculateTimeRemaining = (deadline) => {
    const deadlineDate = new Date(deadline);
    const now = new Date();
    
    // Check for invalid date
    if (!(deadlineDate instanceof Date) || isNaN(deadlineDate)) {
      return { overdue: false, status: 'unknown' };
    }
    
    const diffInMs = deadlineDate - now;
    const overdue = diffInMs < 0;
    const absDiffInMs = Math.abs(diffInMs);
    
    // Convert to different time units
    const days = Math.floor(absDiffInMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((absDiffInMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((absDiffInMs % (1000 * 60 * 60)) / (1000 * 60));
    
    // Determine status
    let status = 'normal';
    if (overdue) {
      status = 'overdue';
    } else if (days === 0 && hours < 24) {
      status = 'urgent';
    } else if (days < 3) {
      status = 'warning';
    }
    
    return {
      days,
      hours,
      minutes,
      overdue,
      status,
      text: overdue 
        ? `Overdue by ${days ? `${days}d ` : ''}${hours}h ${minutes}m`
        : `${days ? `${days}d ` : ''}${hours}h ${minutes}m remaining`
    };
  };
  
  /**
   * Get the status color for an issue status
   * @param {string} status - Issue status
   * @returns {string} CSS color class
   */
  export const getStatusColor = (status) => {
    const statusMap = {
      'new': 'status-new',
      'open': 'status-open',
      'in-progress': 'status-in-progress',
      'pending': 'status-pending',
      'resolved': 'status-resolved',
      'closed': 'status-closed',
      'reopened': 'status-reopened'
    };
    
    return statusMap[status.toLowerCase()] || 'status-default';
  };
  
  /**
   * Get the priority color for an issue priority
   * @param {string|number} priority - Issue priority (high/medium/low or 1/2/3)
   * @returns {string} CSS color class
   */
  export const getPriorityColor = (priority) => {
    // Handle numeric priorities
    if (typeof priority === 'number' || !isNaN(Number(priority))) {
      const numPriority = Number(priority);
      if (numPriority === 1) return 'priority-high';
      if (numPriority === 2) return 'priority-medium';
      if (numPriority === 3) return 'priority-low';
      return 'priority-default';
    }
    
    // Handle string priorities
    const priorityStr = String(priority).toLowerCase();
    if (priorityStr === 'high' || priorityStr === 'urgent') return 'priority-high';
    if (priorityStr === 'medium' || priorityStr === 'normal') return 'priority-medium';
    if (priorityStr === 'low') return 'priority-low';
    
    return 'priority-default';
  };
  
  /**
   * Filter and sort an array of objects
   * @param {Array} items - Array of objects to filter and sort
   * @param {Object} filters - Filter criteria
   * @param {Object} sortOptions - Sort options (field and direction)
   * @returns {Array} Filtered and sorted array
   */
  export const filterAndSortItems = (items, filters = {}, sortOptions = {}) => {
    if (!Array.isArray(items)) return [];
    
    // Apply filters
    let result = [...items];
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        result = result.filter(item => {
          const itemValue = item[key];
          
          // Handle array values (OR logic)
          if (Array.isArray(value)) {
            return value.includes(itemValue);
          }
          
          // Handle string with partial matches
          if (typeof itemValue === 'string' && typeof value === 'string') {
            return itemValue.toLowerCase().includes(value.toLowerCase());
          }
          
          // Handle exact matches
          return itemValue === value;
        });
      }
    });
    
    // Apply sorting
    if (sortOptions.field) {
      const { field, direction = 'asc' } = sortOptions;
      
      result.sort((a, b) => {
        let aValue = a[field];
        let bValue = b[field];
        
        // Handle string comparison
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }
        
        // Handle date comparison
        if (aValue instanceof Date && bValue instanceof Date) {
          return direction === 'asc' ? aValue - bValue : bValue - aValue;
        }
        
        // Handle null/undefined values
        if (aValue === null || aValue === undefined) return direction === 'asc' ? -1 : 1;
        if (bValue === null || bValue === undefined) return direction === 'asc' ? 1 : -1;
        
        // Default comparison
        if (aValue < bValue) return direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    
    return result;
  };
  
  /**
   * Group items by a specific field
   * @param {Array} items - Array of objects to group
   * @param {string} field - Field to group by
   * @returns {Object} Grouped items
   */
  export const groupItemsByField = (items, field) => {
    if (!Array.isArray(items) || !field) return {};
    
    return items.reduce((acc, item) => {
      const key = item[field] || 'undefined';
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item);
      return acc;
    }, {});
  };
  
  /**
   * Create data for charts with counts by category
   * @param {Array} items - Array of objects
   * @param {string} field - Field to count by
   * @returns {Array} Data for charts
   */
  export const createChartData = (items, field) => {
    if (!Array.isArray(items) || !field) return [];
    
    const grouped = groupItemsByField(items, field);
    
    return Object.entries(grouped).map(([key, values]) => ({
      name: key,
      value: values.length
    }));
  };
  
  export default {
    formatDate,
    truncateString,
    getInitials,
    formatNumber,
    generateUniqueId,
    calculateTimeRemaining,
    getStatusColor,
    getPriorityColor,
    filterAndSortItems,
    groupItemsByField,
    createChartData
  };