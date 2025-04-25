import React, { useState } from 'react';
import { FaBell, FaCheck, FaExclamationCircle, FaInfoCircle } from 'react-icons/fa';

function LecturerNotifications() {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'info',
      title: 'New Student Registration',
      message: 'John Doe has registered for your course "Advanced Mathematics"',
      date: '2024-03-24 10:30 AM',
      read: false
    },
    {
      id: 2,
      type: 'warning',
      title: 'Assignment Deadline Approaching',
      message: 'The deadline for "Calculus Assignment 3" is in 24 hours',
      date: '2024-03-24 09:15 AM',
      read: true
    },
    {
      id: 3,
      type: 'success',
      title: 'Issue Resolved',
      message: 'The technical issue with the online quiz system has been resolved',
      date: '2024-03-23 02:45 PM',
      read: true
    }
  ]);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'info':
        return <FaInfoCircle className="text-blue-500" />;
      case 'warning':
        return <FaExclamationCircle className="text-yellow-500" />;
      case 'success':
        return <FaCheck className="text-green-500" />;
      default:
        return <FaBell className="text-gray-500" />;
    }
  };

  const markAsRead = (id) => {
    setNotifications(notifications.map(notification =>
      notification.id === id ? { ...notification, read: true } : notification
    ));
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Notifications</h1>
        <button
          className="text-sm text-blue-600 hover:text-blue-800"
          onClick={() => setNotifications(notifications.map(n => ({ ...n, read: true })))}
        >
          Mark all as read
        </button>
      </div>

      <div className="space-y-4">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`bg-white rounded-lg shadow p-4 flex items-start gap-4 ${
              !notification.read ? 'border-l-4 border-blue-500' : ''
            }`}
          >
            <div className="mt-1">
              {getNotificationIcon(notification.type)}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <h3 className="font-medium text-gray-900">{notification.title}</h3>
                <span className="text-sm text-gray-500">{notification.date}</span>
              </div>
              <p className="text-gray-600 mt-1">{notification.message}</p>
              {!notification.read && (
                <button
                  className="text-sm text-blue-600 hover:text-blue-800 mt-2"
                  onClick={() => markAsRead(notification.id)}
                >
                  Mark as read
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default LecturerNotifications; 