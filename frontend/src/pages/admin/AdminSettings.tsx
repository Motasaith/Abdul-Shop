import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
  BellIcon,
  GlobeAltIcon,
  EnvelopeIcon,
  KeyIcon,
  CreditCardIcon,
  UserIcon,
  BuildingStorefrontIcon,
  PhotoIcon,
  PaintBrushIcon,
  ServerIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { getSettings, updateSettings } from '../../store/slices/settingSlice';
import { useTheme } from '../../context/ThemeProvider';

interface Settings {

  notifications: {
    emailNotifications: boolean;
    orderNotifications: boolean;
    lowStockAlerts: boolean;
    userRegistrations: boolean;
    newsletterUpdates: boolean;
  };
  payment: {
    stripeEnabled: boolean;
    paypalEnabled: boolean;
    codEnabled: boolean;
    testMode: boolean;
  };
  email: {
    provider: string;
    fromName: string;
    fromEmail: string;
    smtpHost: string;
    smtpPort: number;
    smtpSecure: boolean;
  };
  appearance: {
    primaryColor: string;
    secondaryColor: string;
    logoUrl: string;
    faviconUrl: string;
    darkMode: boolean;
  };
}



const AdminSettings: React.FC = () => {
  const dispatch = useAppDispatch();
  const { settings, loading, error } = useAppSelector((state) => state.settings);
  const { setTheme } = useTheme();
  const [localSettings, setLocalSettings] = useState<Settings | null>(null);
  const [activeTab, setActiveTab] = useState('notifications');

  useEffect(() => {
    dispatch(getSettings());
  }, [dispatch]);

  useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
    }
  }, [settings]);

  const tabs = [
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'payment', name: 'Payment', icon: CreditCardIcon },
    { id: 'email', name: 'Email', icon: EnvelopeIcon },
    { id: 'appearance', name: 'Appearance', icon: PaintBrushIcon }
  ];

  const handleSave = async () => {
    if (!localSettings) return;
    
    try {
      await dispatch(updateSettings(localSettings)).unwrap();
      toast.success('Settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save settings');
    }
  };

  const updateSetting = (category: keyof Settings, key: string, value: any) => {
    if (!localSettings) return;
    
    setLocalSettings(prev => {
      if (!prev) return null;
      return {
        ...prev,
        [category]: {
          ...prev[category],
          [key]: value
        }
      };
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <XMarkIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">
              Error loading settings: {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!localSettings) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }



  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Settings</h3>
        <div className="space-y-4">
          {Object.entries(localSettings.notifications).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-900 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </label>
                <p className="text-sm text-gray-500">
                  {key === 'emailNotifications' && 'Receive email notifications for important events'}
                  {key === 'orderNotifications' && 'Get notified when new orders are placed'}
                  {key === 'lowStockAlerts' && 'Alert when product inventory is running low'}
                  {key === 'userRegistrations' && 'Notification for new user registrations'}
                  {key === 'newsletterUpdates' && 'Updates about newsletter campaigns'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => updateSetting('notifications', key, !value)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  value ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    value ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );



  const renderPaymentSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-900">Stripe Payments</label>
              <p className="text-sm text-gray-500">Accept credit card payments via Stripe</p>
            </div>
            <button
              type="button"
              onClick={() => updateSetting('payment', 'stripeEnabled', !localSettings.payment.stripeEnabled)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                localSettings.payment.stripeEnabled ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  localSettings.payment.stripeEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-900">PayPal Payments</label>
              <p className="text-sm text-gray-500">Accept payments via PayPal</p>
            </div>
            <button
              type="button"
              onClick={() => updateSetting('payment', 'paypalEnabled', !localSettings.payment.paypalEnabled)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                localSettings.payment.paypalEnabled ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  localSettings.payment.paypalEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-900">Cash on Delivery</label>
              <p className="text-sm text-gray-500">Allow customers to pay upon delivery</p>
            </div>
            <button
              type="button"
              onClick={() => updateSetting('payment', 'codEnabled', !localSettings.payment.codEnabled)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                localSettings.payment.codEnabled ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  localSettings.payment.codEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-900">Test Mode</label>
              <p className="text-sm text-gray-500">Enable test mode for payment processing</p>
            </div>
            <button
              type="button"
              onClick={() => updateSetting('payment', 'testMode', !localSettings.payment.testMode)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                localSettings.payment.testMode ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  localSettings.payment.testMode ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderEmailSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Email Settings</h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email Provider</label>
            <select
              value={localSettings.email.provider}
              onChange={(e) => updateSetting('email', 'provider', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="brevo">Brevo (SendinBlue)</option>
              <option value="mailgun">Mailgun</option>
              <option value="sendgrid">SendGrid</option>
              <option value="smtp">Custom SMTP</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">From Name</label>
            <input
              type="text"
              value={localSettings.email.fromName}
              onChange={(e) => updateSetting('email', 'fromName', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">From Email</label>
            <input
              type="email"
              value={localSettings.email.fromEmail}
              onChange={(e) => updateSetting('email', 'fromEmail', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">SMTP Host</label>
            <input
              type="text"
              value={localSettings.email.smtpHost}
              onChange={(e) => updateSetting('email', 'smtpHost', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">SMTP Port</label>
            <input
              type="number"
              value={localSettings.email.smtpPort}
              onChange={(e) => updateSetting('email', 'smtpPort', parseInt(e.target.value))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={localSettings.email.smtpSecure}
              onChange={(e) => updateSetting('email', 'smtpSecure', e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label className="ml-2 block text-sm text-gray-900">Use secure connection (TLS/SSL)</label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Appearance Settings</h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Primary Color</label>
            <div className="flex items-center space-x-3 mt-1">
              <input
                type="color"
                value={localSettings.appearance.primaryColor}
                onChange={(e) => updateSetting('appearance', 'primaryColor', e.target.value)}
                className="h-10 w-16 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
              />
              <input
                type="text"
                value={localSettings.appearance.primaryColor}
                onChange={(e) => updateSetting('appearance', 'primaryColor', e.target.value)}
                className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Secondary Color</label>
            <div className="flex items-center space-x-3 mt-1">
              <input
                type="color"
                value={localSettings.appearance.secondaryColor}
                onChange={(e) => updateSetting('appearance', 'secondaryColor', e.target.value)}
                className="h-10 w-16 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
              />
              <input
                type="text"
                value={localSettings.appearance.secondaryColor}
                onChange={(e) => updateSetting('appearance', 'secondaryColor', e.target.value)}
                className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Logo URL</label>
            <input
              type="url"
              value={localSettings.appearance.logoUrl}
              onChange={(e) => updateSetting('appearance', 'logoUrl', e.target.value)}
              placeholder="https://example.com/logo.png"
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Favicon URL</label>
            <input
              type="url"
              value={localSettings.appearance.faviconUrl}
              onChange={(e) => updateSetting('appearance', 'faviconUrl', e.target.value)}
              placeholder="https://example.com/favicon.ico"
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-6">
          <div>
            <label className="text-sm font-medium text-gray-900 dark:text-white">Dark Mode</label>
            <p className="text-sm text-gray-500 dark:text-gray-400">Enable dark theme for the admin panel</p>
          </div>
          <button
            type="button"
            onClick={() => {
              const newDarkMode = !localSettings.appearance.darkMode;
              updateSetting('appearance', 'darkMode', newDarkMode);
              setTheme(newDarkMode ? 'dark' : 'light');
            }}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              localSettings.appearance.darkMode ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                localSettings.appearance.darkMode ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'notifications':
        return renderNotificationSettings();
      case 'payment':
        return renderPaymentSettings();
      case 'email':
        return renderEmailSettings();
      case 'appearance':
        return renderAppearanceSettings();
      default:
        return renderNotificationSettings();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage your application settings and preferences
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={handleSave}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 lg:grid-cols-4">
          {/* Sidebar */}
          <div className="lg:col-span-1 bg-gray-50 dark:bg-gray-900/50 border-r border-gray-200 dark:border-gray-700">
            <nav className="space-y-1 p-4">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border-blue-500'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="lg:col-span-3 p-6">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
