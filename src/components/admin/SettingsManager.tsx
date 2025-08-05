import React, { useState } from 'react';
import { Settings, Database, Download, Upload, Shield, Palette } from 'lucide-react';
import DataExporter from '../DataExporter';
import DataImporter from '../DataImporter';
import ThemeToggle from '../ThemeToggle';

const SettingsManager: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'general' | 'data' | 'security' | 'appearance'>('general');

  const sections = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'data', label: 'Data Management', icon: Database },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h2>
      </div>

      {/* Settings Navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            {sections.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveSection(id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeSection === id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Settings Content */}
        <div className="p-6">
          {activeSection === 'general' && <GeneralSettings />}
          {activeSection === 'data' && <DataManagementSettings />}
          {activeSection === 'security' && <SecuritySettings />}
          {activeSection === 'appearance' && <AppearanceSettings />}
        </div>
      </div>
    </div>
  );
};

const GeneralSettings: React.FC = () => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">General Settings</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Site Title
          </label>
          <input
            type="text"
            defaultValue="Aquatic Play Equipment Catalog"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Contact Email
          </label>
          <input
            type="email"
            defaultValue="admin@example.com"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Site Description
        </label>
        <textarea
          rows={3}
          defaultValue="Professional aquatic play equipment for water parks and recreational facilities."
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
      </div>

      <div className="flex justify-end">
        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
          Save Changes
        </button>
      </div>
    </div>
  );
};

const DataManagementSettings: React.FC = () => {
  return (
    <div className="space-y-8">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Data Management</h3>
      
      {/* Export Data */}
      <div>
        <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4 flex items-center">
          <Download className="w-5 h-5 mr-2" />
          Export Data
        </h4>
        <DataExporter />
      </div>

      {/* Import Data */}
      <div>
        <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4 flex items-center">
          <Upload className="w-5 h-5 mr-2" />
          Import Data
        </h4>
        <DataImporter />
      </div>
    </div>
  );
};

const SecuritySettings: React.FC = () => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Security Settings</h3>
      
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">
          Authentication
        </h4>
        <p className="text-sm text-blue-800 dark:text-blue-400">
          User authentication is handled by Supabase Auth. To manage user accounts, go to your Supabase Dashboard → Authentication → Users.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">Row Level Security</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">Database access is protected by RLS policies</p>
          </div>
          <span className="px-2 py-1 text-xs rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
            Enabled
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">API Security</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">API endpoints are secured with authentication</p>
          </div>
          <span className="px-2 py-1 text-xs rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
            Active
          </span>
        </div>
      </div>
    </div>
  );
};

const AppearanceSettings: React.FC = () => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Appearance Settings</h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">Theme</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">Choose between light and dark mode</p>
          </div>
          <ThemeToggle size="lg" showLabel />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">Animations</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">Enable smooth transitions and animations</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" defaultChecked />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>
    </div>
  );
};

export default SettingsManager;