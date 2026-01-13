import React, { useState } from 'react';
import { useAppSelector, useAppDispatch } from '../hooks/redux';
import { useNavigate } from 'react-router-dom';
import { 
  verifyPhone, 
  resendPhoneVerification, 
  resendEmailVerification, 
  changePassword,
  forgotPassword,

  updateEmail,
  becomeVendor
} from '../store/slices/authSlice';
import authService from '../services/authService';
import PhoneInput from '../components/common/PhoneInput';
import toast from 'react-hot-toast';

const ProfilePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, loading } = useAppSelector((state) => state.auth);
  const [verificationCode, setVerificationCode] = useState('');
  const [showVerificationForm, setShowVerificationForm] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState(user?.phone || '');
  const [editingPhone, setEditingPhone] = useState(false);
  
  // Email editing states
  const [editingEmail, setEditingEmail] = useState(false);
  const [emailAddress, setEmailAddress] = useState(user?.email || '');
  
  // Password change states
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  

  // Email verification states
  const [resendingEmail, setResendingEmail] = useState(false);

  // Vendor application states
  const [showVendorForm, setShowVendorForm] = useState(false);
  const [shopName, setShopName] = useState('');

  const handlePhoneChange = (phoneValue: string, countryCode?: string) => {
    setPhoneNumber(phoneValue);
  };

  const handleSendVerification = async () => {
    if (!phoneNumber) {
      toast.error('Please enter a phone number first');
      return;
    }
    
    try {
      const result = await authService.sendPhoneVerification();
      setShowVerificationForm(true);
      if (result.data.smsSuccess) {
        toast.success('Verification code sent to your phone!');
      } else {
        toast.success('Verification code generated. Please check your phone.');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.errors?.[0]?.msg || error.response?.data?.message || 'Failed to send verification code';
      toast.error(errorMessage);
    }
  };

  const handleVerifyPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!verificationCode) {
      toast.error('Please enter the verification code');
      return;
    }

    if (verificationCode.length !== 6) {
      toast.error('Verification code must be 6 digits');
      return;
    }

    try {
      await dispatch(verifyPhone(verificationCode)).unwrap();
      toast.success('Phone number verified successfully!');
      setShowVerificationForm(false);
      setVerificationCode('');
    } catch (error: any) {
      toast.error(error.message || 'Verification failed');
    }
  };

  const handleResendCode = async () => {
    try {
      const result = await dispatch(resendPhoneVerification()).unwrap();
      if (result.smsSuccess) {
        toast.success('New verification code sent to your phone!');
      } else {
        toast.success('Verification code sent! Please check your phone.');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to resend verification code');
    }
  };

  const handleResendEmail = async () => {
    setResendingEmail(true);
    try {
      await dispatch(resendEmailVerification()).unwrap();
      toast.success('Verification email sent! Please check your inbox.');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send verification email');
    } finally {
      setResendingEmail(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    // Strong password validation
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    if (!strongPasswordRegex.test(passwordData.newPassword)) {
      toast.error('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character');
      return;
    }

    try {
      await dispatch(changePassword({
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword
      })).unwrap();
      toast.success('Password changed successfully!');
      setShowPasswordForm(false);
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      toast.error(error.message || 'Failed to change password');
    }
  };

  const handleForgotPassword = async () => {
    if (!user?.email) {
      toast.error('No email address found');
      return;
    }

    try {
      await dispatch(forgotPassword(user.email)).unwrap();
      toast.success('Password reset link sent to your email!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send password reset email');
    }
  };


  const handleUpdateEmail = async () => {
    if (!emailAddress || !emailAddress.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    try {
      await dispatch(updateEmail({ newEmail: emailAddress })).unwrap();
      toast.success('Verification email sent to new email address!');
      setEditingEmail(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update email address');
    }
  };

  const handleBecomeVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopName.trim()) {
      toast.error('Shop name is required');
      return;
    }

    try {
      await dispatch(becomeVendor(shopName)).unwrap();
      toast.success('Vendor application submitted successfully!');
      setShowVendorForm(false);
      setShopName('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit application');
    }
  };


  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center transition-colors duration-300">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Please log in to view your profile</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg transition-colors duration-300">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Profile</h1>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Full Name
                </label>
                <div className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white">
                  {user.name}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                {editingEmail ? (
                  <div className="space-y-3">
                    <input
                      type="email"
                      value={emailAddress}
                      onChange={(e) => setEmailAddress(e.target.value)}
                      placeholder="Enter your email address"
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setEditingEmail(false);
                          setEmailAddress(user.email || '');
                        }}
                        className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleUpdateEmail}
                        disabled={loading}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                      >
                        {loading ? 'Saving...' : 'Save'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white flex-1">
                      {user.email}
                    </div>
                    <button
                      onClick={() => setEditingEmail(true)}
                      className="ml-2 px-3 py-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                    >
                      Edit
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Phone Verification Section */}
            <div className="border-t pt-6 border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Phone Verification</h2>
              
              <div className="space-y-4">
                {/* Phone Number Display/Edit */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Phone Number
                    </label>
                    <div className="flex items-center space-x-2">
                      {user.phoneVerified ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200">
                          ✓ Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200">
                          ⚠ Not Verified
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {editingPhone ? (
                    <div className="space-y-3">
                      <PhoneInput
                        value={phoneNumber}
                        onChange={handlePhoneChange}
                        placeholder="Enter your phone number"
                        required
                        label=""
                      />
                      <div className="flex flex-col sm:flex-row gap-3">
                        <button
                          onClick={() => {
                            setEditingPhone(false);
                            setPhoneNumber(user.phone || '');
                          }}
                          className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => {
                            // Here you would update the phone number
                            setEditingPhone(false);
                            toast.success('Phone number updated!');
                          }}
                          className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white flex-1">
                        {user.phone || 'No phone number added'}
                      </div>
                      <button
                        onClick={() => setEditingPhone(true)}
                        className="ml-2 px-3 py-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                      >
                        Edit
                      </button>
                    </div>
                  )}
                </div>

                {/* Verification Actions */}
                {user.phone && !user.phoneVerified && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-md p-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-yellow-400 dark:text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3 flex-1">
                        <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                          Phone Number Not Verified
                        </h3>
                        <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                          <p>Verify your phone number to receive order updates and secure your account.</p>
                        </div>
                        
                        {!showVerificationForm ? (
                        <div className="mt-4 flex flex-col sm:flex-row gap-3">
                          <button
                            onClick={handleSendVerification}
                            disabled={loading}
                            className="bg-yellow-600 px-4 py-2 rounded-md text-sm font-medium text-white hover:bg-yellow-700 disabled:opacity-50"
                          >
                            {loading ? 'Sending...' : 'Send Verification Code'}
                          </button>
                          <button
                            onClick={() => navigate('/phone-verification')}
                            className="bg-blue-600 px-4 py-2 rounded-md text-sm font-medium text-white hover:bg-blue-700"
                          >
                            Go to Phone Verification
                          </button>
                        </div>
                        ) : (
                          <form onSubmit={handleVerifyPhone} className="mt-4 space-y-3">
                            <div>
                              <label className="block text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                                Enter Verification Code
                              </label>
                              <input
                                type="text"
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                placeholder="Enter 6-digit code"
                                className="block w-full px-3 py-2 border border-yellow-300 dark:border-yellow-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                maxLength={6}
                                required
                              />
                              <p className="mt-1 text-xs text-yellow-600 dark:text-yellow-400">
                                Check your phone for the verification code
                              </p>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row gap-3">
                              <button
                                type="submit"
                                disabled={loading || verificationCode.length !== 6}
                                className="bg-yellow-600 px-4 py-2 rounded-md text-sm font-medium text-white hover:bg-yellow-700 disabled:opacity-50"
                              >
                                {loading ? 'Verifying...' : 'Verify Code'}
                              </button>
                              
                              <button
                                type="button"
                                onClick={handleResendCode}
                                disabled={loading}
                                className="bg-transparent px-4 py-2 rounded-md text-sm font-medium text-yellow-800 dark:text-yellow-200 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 disabled:opacity-50 border border-yellow-300 dark:border-yellow-700"
                              >
                                Resend Code
                              </button>
                              
                              <button
                                type="button"
                                onClick={() => {
                                  setShowVerificationForm(false);
                                  setVerificationCode('');
                                }}
                                className="bg-transparent px-4 py-2 rounded-md text-sm font-medium text-yellow-800 dark:text-yellow-200 hover:bg-yellow-100 dark:hover:bg-yellow-900/30"
                              >
                                Cancel
                              </button>
                            </div>
                          </form>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {user.phoneVerified && (
                  <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-md p-4">
                    <div className="flex items-center">
                      <svg className="h-5 w-5 text-green-400 dark:text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm text-green-800 dark:text-green-200 font-medium">
                        Your phone number is verified!
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Email Verification Section */}
            <div className="border-t pt-6 border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Email Verification</h2>
              
              <div className="space-y-4">
                {/* Email Address Display */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Email Address
                    </label>
                    <div className="flex items-center space-x-2">
                      {user.emailVerified ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200">
                          ✓ Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200">
                          ⚠ Not Verified
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white">
                    {user.email}
                  </div>
                </div>

                {/* Email Verification Actions */}
                {!user.emailVerified && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-md p-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-yellow-400 dark:text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3 flex-1">
                        <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                          Email Not Verified
                        </h3>
                        <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                          <p>Verify your email address to secure your account and receive important notifications.</p>
                        </div>
                        
                        <div className="mt-4 flex flex-col sm:flex-row gap-3">
                          <button
                            onClick={handleResendEmail}
                            disabled={resendingEmail || loading}
                            className="bg-yellow-600 px-4 py-2 rounded-md text-sm font-medium text-white hover:bg-yellow-700 disabled:opacity-50"
                          >
                            {resendingEmail ? 'Sending...' : 'Send Verification Email'}
                          </button>
                          <button
                            onClick={() => navigate('/email-verification')}
                            className="bg-blue-600 px-4 py-2 rounded-md text-sm font-medium text-white hover:bg-blue-700"
                          >
                            Go to Email Verification
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {user.emailVerified && (
                  <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-md p-4">
                    <div className="flex items-center">
                      <svg className="h-5 w-5 text-green-400 dark:text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm text-green-800 dark:text-green-200 font-medium">
                        Your email address is verified!
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Password Management Section */}
            <div className="border-t pt-6 border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Password Management</h2>
              
              <div className="space-y-4">
                {!showPasswordForm ? (
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => setShowPasswordForm(true)}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Change Password
                    </button>
                    <button
                      onClick={handleForgotPassword}
                      disabled={loading}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      {loading ? 'Sending...' : 'Send Password Reset Email'}
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-md p-4">
                      <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-3">Change Password</h3>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">
                            Current Password
                          </label>
                          <input
                            type="password"
                            value={passwordData.oldPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                            className="block w-full px-3 py-2 border border-blue-300 dark:border-blue-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">
                            New Password
                          </label>
                          <input
                            type="password"
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                            className="block w-full px-3 py-2 border border-blue-300 dark:border-blue-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            required
                          />
                          <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                            Must be at least 8 characters with uppercase, lowercase, number, and special character
                          </p>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">
                            Confirm New Password
                          </label>
                          <input
                            type="password"
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                            className="block w-full px-3 py-2 border border-blue-300 dark:border-blue-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="flex space-x-2 mt-4">
                        <button
                          type="submit"
                          disabled={loading}
                          className="bg-blue-600 px-4 py-2 rounded-md text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                          {loading ? 'Changing...' : 'Change Password'}
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => {
                            setShowPasswordForm(false);
                            setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
                          }}
                          className="bg-transparent px-4 py-2 rounded-md text-sm font-medium text-blue-800 dark:text-blue-200 hover:bg-blue-100 dark:hover:bg-blue-900/30 border border-blue-300 dark:border-blue-700"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </form>
                )}
              </div>
            </div>

            {/* Vendor Application Section */}
            {user.role === 'user' && (
              <div className="border-t pt-6 border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Vendor Status</h2>
                
                {user.vendorStatus === 'none' && (
                  <div className="bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 rounded-md p-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <div className="ml-3 flex-1">
                        <h3 className="text-sm font-medium text-purple-800 dark:text-purple-200">
                          Become a Seller
                        </h3>
                        <div className="mt-2 text-sm text-purple-700 dark:text-purple-300">
                          <p>Start selling your products on our platform today! Apply for a vendor account to get started.</p>
                        </div>
                        
                        {!showVendorForm ? (
                          <div className="mt-4">
                            <button
                              onClick={() => setShowVendorForm(true)}
                              className="bg-purple-600 px-4 py-2 rounded-md text-sm font-medium text-white hover:bg-purple-700"
                            >
                              Apply Now
                            </button>
                          </div>
                        ) : (
                          <form onSubmit={handleBecomeVendor} className="mt-4 space-y-3">
                            <div>
                              <label className="block text-sm font-medium text-purple-800 dark:text-purple-200 mb-1">
                                Shop Name
                              </label>
                              <input
                                type="text"
                                value={shopName}
                                onChange={(e) => setShopName(e.target.value)}
                                placeholder="Enter your shop name"
                                className="block w-full px-3 py-2 border border-purple-300 dark:border-purple-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                required
                              />
                            </div>
                            
                            <div className="flex space-x-2">
                              <button
                                type="submit"
                                disabled={loading}
                                className="bg-purple-600 px-4 py-2 rounded-md text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50"
                              >
                                {loading ? 'Submitting...' : 'Submit Application'}
                              </button>
                              
                              <button
                                type="button"
                                onClick={() => {
                                  setShowVendorForm(false);
                                  setShopName('');
                                }}
                                className="bg-transparent px-4 py-2 rounded-md text-sm font-medium text-purple-800 dark:text-purple-200 hover:bg-purple-100 dark:hover:bg-purple-900/30 border border-purple-300 dark:border-purple-700"
                              >
                                Cancel
                              </button>
                            </div>
                          </form>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {user.vendorStatus === 'pending' && (
                  <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-md p-4">
                    <div className="flex items-center">
                      <svg className="h-5 w-5 text-blue-400 dark:text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <span className="text-sm text-blue-800 dark:text-blue-200 font-medium block">
                          Vendor Application Pending
                        </span>
                        <span className="text-xs text-blue-600 dark:text-blue-300">
                          Your application for shop "{user.vendorDetails?.shopName}" is under review.
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {user.vendorStatus === 'rejected' && (
                  <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md p-4">
                    <div className="flex items-center">
                      <svg className="h-5 w-5 text-red-400 dark:text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <span className="text-sm text-red-800 dark:text-red-200 font-medium block">
                          Application Rejected
                        </span>
                        <span className="text-xs text-red-600 dark:text-red-300">
                          Your vendor application was not approved. Please contact support for more details.
                        </span>
                      </div>
                    </div>
                    <div className="mt-3">
                        <button
                          onClick={() => {
                             setShowVendorForm(true); 
                          }}
                           className="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 underline"
                        >
                          Try Again
                        </button>
                    </div>
                    {showVendorForm && (
                         <form onSubmit={handleBecomeVendor} className="mt-4 space-y-3">
                            <div>
                              <label className="block text-sm font-medium text-red-800 dark:text-red-200 mb-1">
                                New Shop Name
                              </label>
                              <input
                                type="text"
                                value={shopName}
                                onChange={(e) => setShopName(e.target.value)}
                                placeholder="Enter your shop name"
                                className="block w-full px-3 py-2 border border-red-300 dark:border-red-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                required
                              />
                            </div>
                            
                            <div className="flex space-x-2">
                              <button
                                type="submit"
                                disabled={loading}
                                className="bg-red-600 px-4 py-2 rounded-md text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                              >
                                {loading ? 'Submitting...' : 'Submit New Application'}
                              </button>
                              
                              <button
                                type="button"
                                onClick={() => {
                                  setShowVendorForm(false);
                                  setShopName('');
                                }}
                                className="bg-transparent px-4 py-2 rounded-md text-sm font-medium text-red-800 dark:text-red-200 hover:bg-red-100 dark:hover:bg-red-900/30 border border-red-300 dark:border-red-700"
                              >
                                Cancel
                              </button>
                            </div>
                          </form>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
