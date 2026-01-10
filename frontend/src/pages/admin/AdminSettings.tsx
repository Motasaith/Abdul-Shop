import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
  Bell,
  CreditCard,
  Mail,
  Palette,
  Shield,
  Globe,
  Save,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  Lock,
  Server
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { getSettings, updateSettings } from '../../store/slices/settingSlice';
import { useTheme } from '../../context/ThemeProvider';
import { motion, AnimatePresence } from 'framer-motion';

// Define strict interfaces matching backend schema
interface GeneralSettings {
  siteName: string;
  siteUrl: string;
  currency: string;
  language: string;
  timezone: string;
}

interface NotificationSettings {
  emailNotifications: boolean;
  orderNotifications: boolean;
  lowStockAlerts: boolean;
  userRegistrations: boolean;
  newsletterUpdates: boolean;
}

interface SecuritySettings {
  passwordExpiry: number;
  sessionTimeout: number;
  twoFactorEnabled: boolean;
  adminIpRestriction: boolean;
  allowedIps: string[];
}

interface StripeSettings {
  isEnabled: boolean;
  publishableKey: string;
  secretKey: string;
}

interface BankTransferSettings {
  isEnabled: boolean;
  accountName: string;
  accountNumber: string;
  bankName: string;
  instructions: string;
}

interface CODSettings {
  isEnabled: boolean;
}

interface PaymentSettings {
  stripe: StripeSettings;
  bankTransfer: BankTransferSettings;
  cod: CODSettings;
  testMode: boolean;
}

interface EmailSettings {
  provider: string;
  fromName: string;
  fromEmail: string;
  smtpHost: string;
  smtpPort: number;
  smtpSecure: boolean;
  smtpUser: string;
  smtpPass: string;
}

interface AppearanceSettings {
  primaryColor: string;
  secondaryColor: string;
  logoUrl: string;
  faviconUrl: string;
  darkMode: boolean;
  customCss: string;
}

interface Settings {
  general: GeneralSettings;
  notifications: NotificationSettings;
  security: SecuritySettings;
  payment: PaymentSettings;
  email: EmailSettings;
  appearance: AppearanceSettings;
}

const AdminSettings: React.FC = () => {
  const dispatch = useAppDispatch();
  const { settings, loading, error } = useAppSelector((state) => state.settings);
  const { setTheme } = useTheme();
  
  // Use a local state that defaults to a safe structure to avoid undefined errors
  const [localSettings, setLocalSettings] = useState<Settings | null>(null);
  const [activeTab, setActiveTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    dispatch(getSettings());
  }, [dispatch]);

  useEffect(() => {
    if (settings) {
      setLocalSettings(settings as unknown as Settings);
    }
  }, [settings]);

  const tabs = [
    { id: 'general', name: 'General', icon: Globe },
    { id: 'payment', name: 'Payment', icon: CreditCard },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'email', name: 'Email', icon: Mail },
    { id: 'appearance', name: 'Appearance', icon: Palette }
  ];

  const handleSave = async () => {
    if (!localSettings) return;
    
    try {
      setIsSaving(true);
      await dispatch(updateSettings(localSettings)).unwrap();
      toast.success('Settings saved successfully!');
      // Update theme if it changed
      setTheme(localSettings.appearance.darkMode ? 'dark' : 'light');
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  // Helper to update deeply nested state safely
  const updateState = (path: string, value: any) => {
    setLocalSettings(prev => {
      if (!prev) return null;
      const newState = { ...prev };
      const parts = path.split('.');
      let current: any = newState;
      
      for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        // Create a shallow copy of the nested object to avoid mutating read-only state
        current[part] = current[part] ? { ...current[part] } : {};
        current = current[part];
      }
      
      current[parts[parts.length - 1]] = value;
      return newState;
    });
  };

  if (loading && !localSettings) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl inline-flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          <span>Error loading settings: {error}</span>
        </div>
      </div>
    );
  }

  if (!localSettings) return null;

  const renderContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-500" />
              General Settings
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Site Name</label>
                <input
                  type="text"
                  value={localSettings.general?.siteName || ''}
                  onChange={(e) => updateState('general.siteName', e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Site URL</label>
                <input
                  type="url"
                  value={localSettings.general?.siteUrl || ''}
                  onChange={(e) => updateState('general.siteUrl', e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Currency</label>
                <select
                  value={localSettings.general?.currency || 'USD'}
                  onChange={(e) => updateState('general.currency', e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="PKR">PKR (Rs)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Language</label>
                <select
                  value={localSettings.general?.language || 'en'}
                  onChange={(e) => updateState('general.language', e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="ur">Urdu</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 'payment':
        return (
          <div className="space-y-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-500" />
              Payment Gateways
            </h2>

            {/* Test Mode Toggle */}
            <div className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900/30 rounded-xl">
              <div>
                <h3 className="font-medium text-yellow-800 dark:text-yellow-400">Sandbox / Test Mode</h3>
                <p className="text-sm text-yellow-600 dark:text-yellow-500/80">Process payments without real charges</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSettings.payment?.testMode || false}
                  onChange={(e) => updateState('payment.testMode', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 dark:peer-focus:ring-yellow-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-yellow-500"></div>
              </label>
            </div>

            {/* Stripe Section */}
            <div className="space-y-4 p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Stripe Integration</h3>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localSettings.payment?.stripe?.isEnabled || false}
                    onChange={(e) => updateState('payment.stripe.isEnabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
              {localSettings.payment?.stripe?.isEnabled && (
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Publishable Key</label>
                    <input
                      type="text"
                      value={localSettings.payment.stripe.publishableKey || ''}
                      onChange={(e) => updateState('payment.stripe.publishableKey', e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl font-mono text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Secret Key</label>
                    <input
                      type="password"
                      placeholder={localSettings.payment.stripe.secretKey === '********' ? '********' : 'Enter new key to update'}
                      onChange={(e) => updateState('payment.stripe.secretKey', e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl font-mono text-sm"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Bank Transfer Section */}
            <div className="space-y-4 p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
               <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Bank Transfer</h3>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localSettings.payment?.bankTransfer?.isEnabled || false}
                    onChange={(e) => updateState('payment.bankTransfer.isEnabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
               {localSettings.payment?.bankTransfer?.isEnabled && (
                <div className="grid gap-4">
                   <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Bank Name</label>
                    <input
                      type="text"
                      value={localSettings.payment.bankTransfer.bankName || ''}
                      onChange={(e) => updateState('payment.bankTransfer.bankName', e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Account Number</label>
                    <input
                      type="text"
                      value={localSettings.payment.bankTransfer.accountNumber || ''}
                      onChange={(e) => updateState('payment.bankTransfer.accountNumber', e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl"
                    />
                  </div>
                   <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Account Name</label>
                    <input
                      type="text"
                      value={localSettings.payment.bankTransfer.accountName || ''}
                      onChange={(e) => updateState('payment.bankTransfer.accountName', e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl"
                    />
                  </div>
                   <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Instructions</label>
                    <textarea
                      value={localSettings.payment.bankTransfer.instructions || ''}
                      onChange={(e) => updateState('payment.bankTransfer.instructions', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl"
                    />
                  </div>
                </div>
               )}
            </div>

            {/* COD Section */}
            <div className="space-y-4 p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                   <h3 className="text-lg font-medium text-gray-900 dark:text-white">Cash on Delivery</h3>
                   <p className="text-sm text-gray-500 dark:text-gray-400">Allow customers to pay when order is delivered</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localSettings.payment?.cod?.isEnabled || false}
                    onChange={(e) => updateState('payment.cod.isEnabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
             <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-500" />
              Security Configuration
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Admin IP Restriction</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Limit admin access to specific IP addresses</p>
                </div>
                 <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localSettings.security?.adminIpRestriction || false}
                    onChange={(e) => updateState('security.adminIpRestriction', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

               <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Session Timeout (minutes)</label>
                <input
                  type="number"
                  value={localSettings.security?.sessionTimeout || 60}
                  onChange={(e) => updateState('security.sessionTimeout', parseInt(e.target.value))}
                  className="w-full md:w-1/3 px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl"
                />
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
             <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Bell className="w-5 h-5 text-blue-500" />
              Notification Preferences
            </h2>
            <div className="grid gap-4">
              {Object.entries(localSettings.notifications || {}).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </h3>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={value as boolean}
                      onChange={(e) => updateState(`notifications.${key}`, e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        );

      case 'email':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Mail className="w-5 h-5 text-blue-500" />
              SMTP Configuration
            </h2>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">SMTP Host</label>
                <input
                  type="text"
                  value={localSettings.email?.smtpHost || ''}
                  onChange={(e) => updateState('email.smtpHost', e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl"
                />
              </div>
               <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">SMTP Port</label>
                <input
                  type="number"
                  value={localSettings.email?.smtpPort || 587}
                  onChange={(e) => updateState('email.smtpPort', parseInt(e.target.value))}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl"
                />
              </div>
               <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">From Name</label>
                <input
                  type="text"
                  value={localSettings.email?.fromName || ''}
                  onChange={(e) => updateState('email.fromName', e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl"
                />
              </div>
               <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">From Email</label>
                <input
                  type="email"
                  value={localSettings.email?.fromEmail || ''}
                  onChange={(e) => updateState('email.fromEmail', e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl"
                />
              </div>
               <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">SMTP User</label>
                <input
                  type="text"
                  value={localSettings.email?.smtpUser || ''}
                  onChange={(e) => updateState('email.smtpUser', e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl"
                />
              </div>
               <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">SMTP Password</label>
                <input
                  type="password"
                  placeholder="******"
                  onChange={(e) => updateState('email.smtpPass', e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl"
                />
              </div>
             </div>
          </div>
        );

      case 'appearance':
        return (
          <div className="space-y-6">
             <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Palette className="w-5 h-5 text-blue-500" />
              Theme & Branding
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                 <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Primary Color</label>
                 <div className="flex gap-2">
                   <input
                    type="color"
                    value={localSettings.appearance?.primaryColor || '#3B82F6'}
                    onChange={(e) => updateState('appearance.primaryColor', e.target.value)}
                    className="h-10 w-20 rounded-lg cursor-pointer border border-gray-200 dark:border-gray-700"
                   />
                   <input
                     type="text"
                     value={localSettings.appearance?.primaryColor || '#3B82F6'}
                     onChange={(e) => updateState('appearance.primaryColor', e.target.value)}
                     className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl"
                   />
                 </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Logo URL</label>
                <input
                  type="url"
                  value={localSettings.appearance?.logoUrl || ''}
                  onChange={(e) => updateState('appearance.logoUrl', e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl"
                  placeholder="https://example.com/logo.png"
                />
              </div>

               <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 col-span-full">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Dark Mode Default</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Set default theme for new users</p>
                </div>
                 <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localSettings.appearance?.darkMode || false}
                    onChange={(e) => {
                       updateState('appearance.darkMode', e.target.checked);
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
            Platform Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your store configuration and preferences
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-medium shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
        >
          {isSaving ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          {isSaving ? 'Saving Changes...' : 'Save Configuration'}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700 shadow-xl overflow-hidden p-3 sticky top-6">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                      isActive
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    }`}
                  >
                    <tab.icon className={`w-5 h-5 ${isActive ? 'text-blue-500' : 'text-gray-400'}`} />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* content Area */}
        <div className="flex-1">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700 shadow-xl p-6"
          >
            {renderContent()}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
