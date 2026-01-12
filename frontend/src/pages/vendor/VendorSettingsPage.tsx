import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { toast } from 'react-hot-toast';
import vendorService from '../../services/vendorService';
import { apiService } from '../../services/api';
import { 
  Store, 
  Image as ImageIcon, 
  CreditCard, 
  Save, 
  CheckCircle 
} from 'lucide-react';

const VendorSettingsPage: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    shopName: '',
    storeDescription: '',
    storeLogo: '',
    storeBanner: '',
    bankDetails: ''
  });

  useEffect(() => {
    if (user && user.vendorDetails) {
      setFormData({
        shopName: user.vendorDetails.shopName || '',
        storeDescription: user.vendorDetails.storeDescription || '',
        storeLogo: user.vendorDetails.storeLogo || '',
        storeBanner: user.vendorDetails.storeBanner || '',
        bankDetails: user.vendorDetails.bankDetails || ''
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await vendorService.updateVendorProfile(formData);
      toast.success('Shop profile updated successfully');
      // Ideally we should update the redux state here too via a thunk, 
      // but for now a toast/refresh is okay or we rely on the next fetch
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.msg || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Shop Profile</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Customize your storefront and payment details</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* General Info */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700/50">
           <h3 className="flex items-center text-lg font-bold text-gray-900 dark:text-white mb-6">
              <Store className="w-5 h-5 mr-2 text-blue-500" />
              Store Information
           </h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Shop Name
                 </label>
                 <input
                    type="text"
                    name="shopName"
                    value={formData.shopName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="e.g. Acme Electronics"
                 />
              </div>
              <div className="md:col-span-2">
                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Store Description
                 </label>
                 <textarea
                    name="storeDescription"
                    value={formData.storeDescription}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                    placeholder="Tell customers about your shop..."
                 />
              </div>
           </div>
        </section>

        {/* Branding */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700/50">
           <h3 className="flex items-center text-lg font-bold text-gray-900 dark:text-white mb-6">
              <ImageIcon className="w-5 h-5 mr-2 text-purple-500" />
              Branding
           </h3>
           <div className="space-y-6">
              {/* Logo */}
              <div>
                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Store Logo (URL)
                 </label>
                 <div className="flex gap-4 items-start">
                    <div className="flex-1">
                       <input
                          type="text"
                          name="storeLogo"
                          value={formData.storeLogo}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none"
                          placeholder="https://example.com/logo.png"
                       />
                       <p className="text-xs text-gray-500 mt-1">Direct link to your logo image</p>
                    </div>
                    <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 overflow-hidden flex-shrink-0">
                       {formData.storeLogo ? (
                          <img src={formData.storeLogo} alt="Logo Preview" className="w-full h-full object-cover" />
                       ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                             <Store className="w-8 h-8" />
                          </div>
                       )}
                    </div>
                 </div>
              </div>

              {/* Banner */}
              <div>
                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Store Banner (URL)
                 </label>
                 <div className="space-y-3">
                     <input
                        type="text"
                        name="storeBanner"
                        value={formData.storeBanner}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none"
                        placeholder="https://example.com/banner.jpg"
                     />
                     <div className="w-full h-32 rounded-xl bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 overflow-hidden relative">
                         {formData.storeBanner ? (
                            <img src={formData.storeBanner} alt="Banner Preview" className="w-full h-full object-cover" />
                         ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                               <p className="text-sm">Banner Preview</p>
                            </div>
                         )}
                     </div>
                 </div>
              </div>
           </div>
        </section>

        {/* Bank Details */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700/50">
           <h3 className="flex items-center text-lg font-bold text-gray-900 dark:text-white mb-6">
              <CreditCard className="w-5 h-5 mr-2 text-green-500" />
              Payment Information
           </h3>
           <div>
               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Bank Details / Payout Info
               </label>
               <textarea
                  name="bankDetails"
                  value={formData.bankDetails}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 outline-none resize-none font-mono text-sm"
                  placeholder="Bank Name: &#10;Account Number: &#10;IFSC/Sort Code: &#10;Account Holder:"
               />
               <p className="text-xs text-gray-500 mt-2 flex items-start gap-1">
                  <CheckCircle className="w-3 h-3 mt-0.5" />
                  <span>This information is encrypted and only visible to admins for payouts.</span>
               </p>
           </div>
        </section>

        <div className="flex justify-end pt-4 pb-12">
           <button 
             type="submit" 
             disabled={loading}
             className="flex items-center px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/30 disabled:opacity-70 disabled:cursor-not-allowed"
           >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              ) : (
                <Save className="w-5 h-5 mr-2" />
              )}
              Save Changes
           </button>
        </div>

      </form>
    </div>
  );
};

export default VendorSettingsPage;
