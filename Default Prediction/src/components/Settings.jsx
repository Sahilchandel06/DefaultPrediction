// src/components/Settings.jsx
import React, { useState } from 'react';

function Settings() {
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: false,
    riskThreshold: 65,
    email: 'admin@example.com',
    timezone: 'Asia/Kolkata'
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Settings</h1>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Account Settings</h2>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={settings.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
              <select
                name="timezone"
                value={settings.timezone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Asia/Kolkata">India (IST)</option>
                <option value="America/New_York">Eastern Time (ET)</option>
                <option value="Europe/London">London (GMT)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Application Settings</h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-sm font-medium text-gray-700">Enable Notifications</label>
              <p className="text-sm text-gray-500">Receive alerts for completed analyses</p>
            </div>
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="notifications"
                checked={settings.notifications}
                onChange={handleChange}
                className="sr-only peer"
              />
              <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="block text-sm font-medium text-gray-700">Dark Mode</label>
              <p className="text-sm text-gray-500">Switch to dark color scheme</p>
            </div>
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="darkMode"
                checked={settings.darkMode}
                onChange={handleChange}
                className="sr-only peer"
              />
              <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Risk Threshold: {settings.riskThreshold}%
            </label>
            <input
              type="range"
              name="riskThreshold"
              min="0"
              max="100"
              value={settings.riskThreshold}
              onChange={handleChange}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Low Risk</span>
              <span>Medium</span>
              <span>High Risk</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition">
          Save Changes
        </button>
      </div>
    </div>
  );
}

export default Settings;