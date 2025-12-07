import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { getSettings, updateSettings } from '../../store/slices/settingSlice';
import toast from 'react-hot-toast';

const PaymentSettings: React.FC = () => {
  const dispatch = useAppDispatch();
  const { settings, loading } = useAppSelector((state) => state.settings);

  const [formData, setFormData] = useState({
    stripe: {
      isEnabled: false,
      publishableKey: '',
      secretKey: ''
    },
    bankTransfer: {
      isEnabled: true,
      accountName: '',
      accountNumber: '',
      bankName: '',
      instructions: ''
    },
    cod: {
      isEnabled: true
    }
  });

  useEffect(() => {
    dispatch(getSettings());
  }, [dispatch]);

  useEffect(() => {
    if (settings?.payment) {
      setFormData({
        stripe: {
          isEnabled: settings.payment.stripe?.isEnabled ?? false,
          publishableKey: settings.payment.stripe?.publishableKey ?? '',
          secretKey: settings.payment.stripe?.secretKey || '' // Will be masked '********'
        },
        bankTransfer: {
            isEnabled: settings.payment.bankTransfer?.isEnabled ?? true,
            accountName: settings.payment.bankTransfer?.accountName ?? '',
            accountNumber: settings.payment.bankTransfer?.accountNumber ?? '',
            bankName: settings.payment.bankTransfer?.bankName ?? '',
            instructions: settings.payment.bankTransfer?.instructions ?? ''
        },
        cod: {
          isEnabled: settings.payment.cod?.isEnabled ?? true
        }
      });
    }
  }, [settings]);

  const handleChange = (section: string, field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleToggle = (section: string) => {
    setFormData((prev: any) => ({
      ...prev,
      [section]: {
        ...prev[section],
        isEnabled: !prev[section].isEnabled
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(updateSettings({ payment: formData })).unwrap();
      toast.success('Payment settings updated');
    } catch (error) {
      toast.error('Failed to update settings');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Payment Configuration</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Stripe Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
             <h2 className="text-lg font-medium text-gray-900">Stripe Payments</h2>
             <button
               type="button"
               onClick={() => handleToggle('stripe')}
               className={`${
                 formData.stripe.isEnabled ? 'bg-blue-600' : 'bg-gray-200'
               } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
             >
               <span
                 className={`${
                   formData.stripe.isEnabled ? 'translate-x-5' : 'translate-x-0'
                 } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
               />
             </button>
          </div>
          
          {formData.stripe.isEnabled && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Publishable Key</label>
                <input
                  type="text"
                  value={formData.stripe.publishableKey}
                  onChange={(e) => handleChange('stripe', 'publishableKey', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                />
              </div>
              <div>
                 <label className="block text-sm font-medium text-gray-700">Secret Key</label>
                 <input
                   type="password"
                   value={formData.stripe.secretKey}
                   onChange={(e) => handleChange('stripe', 'secretKey', e.target.value)}
                   className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                   placeholder={settings?.payment?.stripe?.secretKey ? '********' : 'Enter Secret Key'}
                 />
                 <p className="mt-1 text-xs text-gray-500">Encrypted in database. Leave as '********' to keep unchanged.</p>
              </div>
            </div>
          )}
        </div>

        {/* Bank Transfer Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
             <h2 className="text-lg font-medium text-gray-900">Bank Transfer</h2>
             <button
               type="button"
               onClick={() => handleToggle('bankTransfer')}
               className={`${
                 formData.bankTransfer.isEnabled ? 'bg-blue-600' : 'bg-gray-200'
               } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
             >
               <span
                 className={`${
                   formData.bankTransfer.isEnabled ? 'translate-x-5' : 'translate-x-0'
                 } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
               />
             </button>
          </div>

          {formData.bankTransfer.isEnabled && (
             <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Bank Name</label>
                  <input
                    type="text"
                    value={formData.bankTransfer.bankName}
                    onChange={(e) => handleChange('bankTransfer', 'bankName', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Account Name</label>
                  <input
                    type="text"
                    value={formData.bankTransfer.accountName}
                    onChange={(e) => handleChange('bankTransfer', 'accountName', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Account Number / IBAN</label>
                  <input
                    type="text"
                    value={formData.bankTransfer.accountNumber}
                    onChange={(e) => handleChange('bankTransfer', 'accountNumber', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Instructions</label>
                  <textarea
                    rows={3}
                    value={formData.bankTransfer.instructions}
                    onChange={(e) => handleChange('bankTransfer', 'instructions', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                    placeholder="e.g. Please upload receipt..."
                  />
                </div>
             </div>
          )}
        </div>

        {/* COD Section */}
        <div className="bg-white shadow rounded-lg p-6">
           <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">Cash on Delivery (COD)</h2>
              <button
                type="button"
                onClick={() => handleToggle('cod')}
                className={`${
                  formData.cod.isEnabled ? 'bg-blue-600' : 'bg-gray-200'
                } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
              >
                <span
                  className={`${
                    formData.cod.isEnabled ? 'translate-x-5' : 'translate-x-0'
                  } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                />
              </button>
           </div>
        </div>

        <div className="flex justify-end">
           <button
             type="submit"
             className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
           >
             Save Changes
           </button>
        </div>
      </form>
    </div>
  );
};

export default PaymentSettings;
