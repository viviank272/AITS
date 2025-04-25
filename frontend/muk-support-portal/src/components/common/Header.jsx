import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

const Header = ({ title, showNotifications = true, showSearch = true }) => {
  const { user } = useContext(AuthContext);
  const [showNotificationsPanel, setShowNotificationsPanel] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Sample notifications
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'New issue assigned to you', read: false, timestamp: '10 min ago' },
    { id: 2, text: 'Issue #1234 has been updated', read: false, timestamp: '1 hour ago' },
    { id: 3, text: 'System maintenance scheduled for tonight', read: true, timestamp: '2 days ago' }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const toggleNotificationsPanel = () => {
    setShowNotificationsPanel(!showNotificationsPanel);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      // Handle search
      console.log('Searching for:', searchTerm);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-4 flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">{title}</h1>
      </div>
      
      <div className="flex items-center space-x-4">
        {showSearch && (
          <form onSubmit={handleSubmit} className="relative">
            <input
              type="text"
              className="border border-gray-300 rounded-md py-2 pl-3 pr-10 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Search issues..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button 
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </form>
        )}
        
        {showNotifications && (
          <div className="relative">
            <button 
              className="relative p-1 rounded-full text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              onClick={toggleNotificationsPanel}
              aria-label="Notifications"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 block h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
            
            {showNotificationsPanel && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg overflow-hidden z-20">
                <div className="flex justify-between items-center p-4 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-700">Notifications</h3>
                  <button 
                    className="text-sm text-primary-500 hover:text-primary-700"
                    onClick={() => setNotifications([])}
                  >
                    Clear All
                  </button>
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="text-center text-gray-500 py-4">No notifications</p>
                  ) : (
                    notifications.map(notification => (
                      <div 
                        key={notification.id}
                        className={`p-4 border-b border-gray-100 ${!notification.read ? 'bg-blue-50' : ''}`}
                      >
                        <p className="text-sm text-gray-800 mb-1">{notification.text}</p>
                        <p className="text-xs text-gray-500">{notification.timestamp}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        
        <div className="relative">
          <button className="flex items-center focus:outline-none">
            <div className="h-8 w-8 rounded-full bg-primary-500 text-white flex items-center justify-center font-semibold">
              {user?.name?.charAt(0) || 'U'}
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;