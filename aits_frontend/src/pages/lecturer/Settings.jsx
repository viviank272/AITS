import React, { useState } from 'react';
import { UserIcon, BellIcon, LockClosedIcon, LanguageIcon } from '@heroicons/react/24/outline';

function Settings() {
  const [activeTab, setActiveTab] = useState('profile');
  const [settings, setSettings] = useState({
    profile: {
      name: 'Dr. John Smith',
      email: 'john.smith@university.edu',
      department: 'Computer Science',
      office: 'Room 301, Building A',
      phone: '+1 234 567 8900'
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      newIssueAlerts: true,
      studentMessages: true,
      assignmentDeadlines: true
    },
    security: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    },
    preferences: {
      language: 'English',
      timezone: 'UTC+00:00',
      theme: 'Light'
    }
  });

  const handleInputChange = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSave = (section) => {
    // Here you would typically make an API call to save the settings
    console.log(`Saving ${section} settings:`, settings[section]);
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <UserIcon className="w-5 h-5" /> },
    { id: 'notifications', label: 'Notifications', icon: <BellIcon className="w-5 h-5" /> },
    { id: 'security', label: 'Security', icon: <LockClosedIcon className="w-5 h-5" /> },
    { id: 'preferences', label: 'Preferences', icon: <LanguageIcon className="w-5 h-5" /> }
  ];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-8">Settings</h1>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Tabs */}
        <div className="md:w-64">
          <div className="bg-white rounded-lg shadow">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-500'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
      </div>

        {/* Content */}
        <div className="flex-1">
      <div className="bg-white rounded-lg shadow p-6">
            {activeTab === 'profile' && (
              <div>
                <h2 className="text-xl font-semibold mb-6">Profile Settings</h2>
                <div className="space-y-4">
                  {Object.entries(settings.profile).map(([field, value]) => (
                    <div key={field}>
                      <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                        {field}
                      </label>
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => handleInputChange('profile', field, e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div>
                <h2 className="text-xl font-semibold mb-6">Notification Settings</h2>
                <div className="space-y-4">
                  {Object.entries(settings.notifications).map(([field, value]) => (
                    <div key={field} className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700 capitalize">
                        {field.replace(/([A-Z])/g, ' $1').trim()}
                      </label>
                      <button
                        className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                          value ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                        onClick={() => handleInputChange('notifications', field, !value)}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                            value ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div>
                <h2 className="text-xl font-semibold mb-6">Security Settings</h2>
                <div className="space-y-4">
                  {Object.entries(settings.security).map(([field, value]) => (
                    <div key={field}>
                      <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                        {field.replace(/([A-Z])/g, ' $1').trim()}
                      </label>
                      <input
                        type="password"
                        value={value}
                        onChange={(e) => handleInputChange('security', field, e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'preferences' && (
              <div>
                <h2 className="text-xl font-semibold mb-6">Preferences</h2>
                <div className="space-y-4">
                  {Object.entries(settings.preferences).map(([field, value]) => (
                    <div key={field}>
                      <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                        {field}
                      </label>
                      <select
                        value={value}
                        onChange={(e) => handleInputChange('preferences', field, e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {field === 'language' && (
                          <>
                            <option value="English">English</option>
                            <option value="Spanish">Spanish</option>
                            <option value="French">French</option>
                          </>
                        )}
                        {field === 'timezone' && (
                          <>
                            <option value="UTC+00:00">UTC+00:00</option>
                            <option value="UTC+01:00">UTC+01:00</option>
                            <option value="UTC+02:00">UTC+02:00</option>
                          </>
                        )}
                        {field === 'theme' && (
                          <>
                            <option value="Light">Light</option>
                            <option value="Dark">Dark</option>
                            <option value="System">System</option>
                          </>
                        )}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                onClick={() => handleSave(activeTab)}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings; 