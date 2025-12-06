import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { registerUser, clearError } from '../../store/slices/authSlice';
import PhoneInput from '../../components/common/PhoneInput';
import toast from 'react-hot-toast';
import { useTranslation } from '../../hooks/useTranslation';

const VendorRegisterPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { loading, error, isAuthenticated } = useAppSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    countryCode: 'PK',
    shopName: '',
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/vendor/dashboard');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePhoneChange = (phoneValue: string, countryCode?: string) => {
    setFormData({
      ...formData,
      phone: phoneValue,
      countryCode: countryCode || formData.countryCode,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword || !formData.phone || !formData.shopName) {
      toast.error('Please fill in all fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.phone && !/^\+[1-9]\d{1,14}$/.test(formData.phone.replace(/\s+/g, ''))) {
      toast.error('Please enter a valid phone number with country code');
      return;
    }

    try {
      // Dispatch register with vendor specific data
      // Note: We need to ensure the authSlice/registerUser action supports these extra fields
      // or we might need to modify it. For now assuming we pass them and backend handles it.
      // We are adding role: 'vendor' implicitly here. 
      // Ideally the backend registration endpoint should accept 'role' and 'vendorDetails'.
      
      const registerData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role: 'vendor',
        vendorDetails: {
          shopName: formData.shopName
        }
      };

      // @ts-ignore - Assuming registerUser can take extra args or we will fix types later
      const result = await dispatch(registerUser(registerData)).unwrap();
      
      if (result.vendorStatus === 'pending') {
         toast.success('Registration successful! Your vendor application is pending approval.');
         navigate('/vendor/dashboard'); // Dashboard will show pending state
         return;
      }

      if (result.phoneVerificationRequired) {
        if (result.smsSuccess) {
          toast.success('Registration successful! SMS sent to your phone.');
        } else {
          toast.success('Registration successful! Please check your phone for verification code.');
        }
        navigate('/verify-phone', { 
          state: { 
            phoneNumber: formData.phone,
            devCode: result.devCode 
          }
        });
      } else {
        toast.success('Vendor Registration Successful!');
        navigate('/vendor/dashboard');
      }
    } catch (error) {
      // Error is handled by the useEffect above
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-blue-900">
            Register as a Vendor
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {'Start selling your products today!'}
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="shopName" className="block text-sm font-medium text-gray-700">
                  Shop Name
                </label>
                <input
                  id="shopName"
                  name="shopName"
                  type="text"
                  required
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="e.g. Best Shoes Co"
                  value={formData.shopName}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  {t('auth.name')}
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder={t('auth.name')}
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
              
              <PhoneInput
                value={formData.phone}
                onChange={handlePhoneChange}
                placeholder={t('auth.phone')}
                required
                label={t('auth.phone')}
                className=""
              />
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  {t('auth.email')}
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder={t('auth.email')}
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  {t('auth.password')}
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder={t('auth.password')}
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  {t('auth.confirmPassword')}
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder={t('auth.confirmPassword')}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-900 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  'Register as Vendor'
                )}
              </button>
            </div>
            
            <div className="text-center mt-4">
               <p className="text-sm text-gray-600">
                 Already a vendor?{' '}
                 <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                   Login here
                 </Link>
               </p>
               <p className="text-sm text-gray-600 mt-2">
                 Want to buy instead?{' '}
                 <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
                   Register as Customer
                 </Link>
               </p>
            </div>
        </form>
      </div>
    </div>
  );
};

export default VendorRegisterPage;
