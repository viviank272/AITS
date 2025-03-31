import React, { useState } from 'react';
import { UserCircleIcon, BellIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

const Settings = () => {
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      browser: true,
      updates: true,
      comments: true
    },
    privacy: {
      showProfile: true,
      showStatus: true
    }
  });

  const handleNotificationChange = (key) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: !prev.notifications[key]
      }
    }));
  };

  const handlePrivacyChange = (key) => {
    setSettings(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [key]: !prev.privacy[key]
      }
    }));
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>

        <div className="mt-8 space-y-8">
          {/* Profile Section */}
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                <UserCircleIcon className="h-6 w-6 text-gray-400 inline-block mr-2" />
                Profile Information
              </h3>
              <div className="mt-4 max-w-xl text-sm text-gray-500">
                <p>Update your profile information and contact details.</p>
              </div>
              <div className="mt-5">
                <button className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                  Edit Profile
                </button>
              </div>
            </div>
          </div>

          {/* Notifications Section */}
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                <BellIcon className="h-6 w-6 text-gray-400 inline-block mr-2" />
                Notification Preferences
              </h3>
              <div className="mt-4 space-y-4">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      type="checkbox"
                      checked={settings.notifications.email}
                      onChange={() => handleNotificationChange('email')}
                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label className="font-medium text-gray-700">Email notifications</label>
                    <p className="text-gray-500">Receive email updates about your issues</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      type="checkbox"
                      checked={settings.notifications.browser}
                      onChange={() => handleNotificationChange('browser')}
                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label className="font-medium text-gray-700">Browser notifications</label>
                    <p className="text-gray-500">Get browser notifications for updates</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Privacy Section */}
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                <ShieldCheckIcon className="h-6 w-6 text-gray-400 inline-block mr-2" />
                Privacy Settings
              </h3>
              <div className="mt-4 space-y-4">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      type="checkbox"
                      checked={settings.privacy.showProfile}
                      onChange={() => handlePrivacyChange('showProfile')}
                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label className="font-medium text-gray-700">Show profile to others</label>
                    <p className="text-gray-500">Allow other users to see your profile information</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      type="checkbox"
                      checked={settings.privacy.showStatus}
                      onChange={() => handlePrivacyChange('showStatus')}
                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label className="font-medium text-gray-700">Show online status</label>
                    <p className="text-gray-500">Display your online status to other users</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings; 