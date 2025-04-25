import { useState, useEffect } from 'react';
import {
  Cog6ToothIcon,
  BellIcon,
  ClockIcon,
  EnvelopeIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

function SystemSettings() {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    notifications: {
      email_notifications: true,
      in_app_notifications: true,
      notification_sound: true,
      digest_frequency: 'daily'
    },
    sla: {
      default_response_time: '24',
      escalation_time: '48',
      reminder_interval: '12'
    },
    security: {
      password_expiry_days: '90',
      max_login_attempts: '5',
      session_timeout_minutes: '30',
      require_2fa: false
    },
    email: {
      smtp_server: 'smtp.makerere.ac.ug',
      smtp_port: '587',
      smtp_username: 'support@muk.ac.ug',
      sender_name: 'MUK Support Portal',
      email_signature: 'Best regards,\nMUK Support Team'
    }
  });

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  const handleChange = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSubmit = (e, section) => {
    e.preventDefault();
    // Here you would make an API call to save the settings
    console.log(`Saving ${section} settings:`, settings[section]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center">
          <Cog6ToothIcon className="h-6 w-6 text-gray-400 mr-2" />
          <h1 className="text-2xl font-semibold text-gray-900">System Settings</h1>
        </div>

        <div className="mt-8 space-y-8">
          {/* Notification Settings */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center mb-4">
                <BellIcon className="h-6 w-6 text-gray-400 mr-2" />
                <h2 className="text-lg font-medium text-gray-900">Notification Settings</h2>
              </div>
              <form onSubmit={(e) => handleSubmit(e, 'notifications')} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="email_notifications"
                      checked={settings.notifications.email_notifications}
                      onChange={(e) => handleChange('notifications', 'email_notifications', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="email_notifications" className="ml-2 block text-sm text-gray-900">
                      Email Notifications
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="in_app_notifications"
                      checked={settings.notifications.in_app_notifications}
                      onChange={(e) => handleChange('notifications', 'in_app_notifications', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="in_app_notifications" className="ml-2 block text-sm text-gray-900">
                      In-App Notifications
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="notification_sound"
                      checked={settings.notifications.notification_sound}
                      onChange={(e) => handleChange('notifications', 'notification_sound', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="notification_sound" className="ml-2 block text-sm text-gray-900">
                      Notification Sound
                    </label>
                  </div>
                  <div>
                    <label htmlFor="digest_frequency" className="block text-sm font-medium text-gray-700">
                      Digest Frequency
                    </label>
                    <select
                      id="digest_frequency"
                      value={settings.notifications.digest_frequency}
                      onChange={(e) => handleChange('notifications', 'digest_frequency', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="never">Never</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Save Notification Settings
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* SLA Settings */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center mb-4">
                <ClockIcon className="h-6 w-6 text-gray-400 mr-2" />
                <h2 className="text-lg font-medium text-gray-900">SLA Settings</h2>
              </div>
              <form onSubmit={(e) => handleSubmit(e, 'sla')} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label htmlFor="default_response_time" className="block text-sm font-medium text-gray-700">
                      Default Response Time (hours)
                    </label>
                    <input
                      type="number"
                      id="default_response_time"
                      value={settings.sla.default_response_time}
                      onChange={(e) => handleChange('sla', 'default_response_time', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="escalation_time" className="block text-sm font-medium text-gray-700">
                      Escalation Time (hours)
                    </label>
                    <input
                      type="number"
                      id="escalation_time"
                      value={settings.sla.escalation_time}
                      onChange={(e) => handleChange('sla', 'escalation_time', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="reminder_interval" className="block text-sm font-medium text-gray-700">
                      Reminder Interval (hours)
                    </label>
                    <input
                      type="number"
                      id="reminder_interval"
                      value={settings.sla.reminder_interval}
                      onChange={(e) => handleChange('sla', 'reminder_interval', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Save SLA Settings
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Security Settings */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center mb-4">
                <ShieldCheckIcon className="h-6 w-6 text-gray-400 mr-2" />
                <h2 className="text-lg font-medium text-gray-900">Security Settings</h2>
              </div>
              <form onSubmit={(e) => handleSubmit(e, 'security')} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="password_expiry_days" className="block text-sm font-medium text-gray-700">
                      Password Expiry (days)
                    </label>
                    <input
                      type="number"
                      id="password_expiry_days"
                      value={settings.security.password_expiry_days}
                      onChange={(e) => handleChange('security', 'password_expiry_days', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="max_login_attempts" className="block text-sm font-medium text-gray-700">
                      Max Login Attempts
                    </label>
                    <input
                      type="number"
                      id="max_login_attempts"
                      value={settings.security.max_login_attempts}
                      onChange={(e) => handleChange('security', 'max_login_attempts', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="session_timeout_minutes" className="block text-sm font-medium text-gray-700">
                      Session Timeout (minutes)
                    </label>
                    <input
                      type="number"
                      id="session_timeout_minutes"
                      value={settings.security.session_timeout_minutes}
                      onChange={(e) => handleChange('security', 'session_timeout_minutes', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="require_2fa"
                      checked={settings.security.require_2fa}
                      onChange={(e) => handleChange('security', 'require_2fa', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="require_2fa" className="ml-2 block text-sm text-gray-900">
                      Require Two-Factor Authentication
                    </label>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Save Security Settings
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Email Settings */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center mb-4">
                <EnvelopeIcon className="h-6 w-6 text-gray-400 mr-2" />
                <h2 className="text-lg font-medium text-gray-900">Email Settings</h2>
              </div>
              <form onSubmit={(e) => handleSubmit(e, 'email')} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="smtp_server" className="block text-sm font-medium text-gray-700">
                      SMTP Server
                    </label>
                    <input
                      type="text"
                      id="smtp_server"
                      value={settings.email.smtp_server}
                      onChange={(e) => handleChange('email', 'smtp_server', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="smtp_port" className="block text-sm font-medium text-gray-700">
                      SMTP Port
                    </label>
                    <input
                      type="text"
                      id="smtp_port"
                      value={settings.email.smtp_port}
                      onChange={(e) => handleChange('email', 'smtp_port', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="smtp_username" className="block text-sm font-medium text-gray-700">
                      SMTP Username
                    </label>
                    <input
                      type="text"
                      id="smtp_username"
                      value={settings.email.smtp_username}
                      onChange={(e) => handleChange('email', 'smtp_username', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="sender_name" className="block text-sm font-medium text-gray-700">
                      Sender Name
                    </label>
                    <input
                      type="text"
                      id="sender_name"
                      value={settings.email.sender_name}
                      onChange={(e) => handleChange('email', 'sender_name', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="email_signature" className="block text-sm font-medium text-gray-700">
                      Email Signature
                    </label>
                    <textarea
                      id="email_signature"
                      rows={3}
                      value={settings.email.email_signature}
                      onChange={(e) => handleChange('email', 'email_signature', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Save Email Settings
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SystemSettings; 