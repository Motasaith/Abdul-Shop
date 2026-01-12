import React, { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../hooks/redux';
import { resendEmailVerification, resendEmailVerificationPublic } from '../store/slices/authSlice';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';

const EmailVerificationPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useAppSelector((state) => state.auth);
  const [isResending, setIsResending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  
  // Get email from router state (passed from register page) or from logged in user
  const stateEmail = location.state?.email;
  const displayEmail = user?.email || stateEmail;

  useEffect(() => {
    // If no email available at all, redirect to login
    if (!displayEmail) {
      navigate('/login');
      return;
    }

    // Redirect if user is logged in and already verified
    if (user?.emailVerified) {
      toast.success('Your email address is already verified!');
      navigate('/profile');
      return;
    }

    // Only auto-send email if user is logged in AND we didn't come from registration (stateEmail)
    // If stateEmail exists, it means we just registered, so backend already sent one.
    if (user && !stateEmail && !emailSent) {
      handleSendEmail();
    } else if (stateEmail) {
      // Just set sent to true so we show the "Email Sent" UI immediately
      setEmailSent(true);
    }
  }, [user, navigate, displayEmail, stateEmail, emailSent]);

  const handleSendEmail = async () => {
    if (!user) return;
    
    try {
      await dispatch(resendEmailVerification()).unwrap();
      setEmailSent(true);
      toast.success('Verification email sent to your inbox!');
    } catch (error: any) {
      // toast.error(error.message || 'Failed to send verification email');
    }
  };

  const handleResendEmail = async () => {
    if (!displayEmail) {
      toast.error('Please log in to resend verification email');
      navigate('/login');
      return;
    }
    
    setIsResending(true);
    try {
      if (user) {
        await dispatch(resendEmailVerification()).unwrap();
      } else {
        await dispatch(resendEmailVerificationPublic(displayEmail)).unwrap();
      }
      setEmailSent(true);
      toast.success('New verification email sent to your inbox!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to resend verification email');
    } finally {
      setIsResending(false);
    }
  };

  if (!displayEmail) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          Check Your Email
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          We've sent a verification link to
        </p>
        <p className="text-center text-sm font-medium text-gray-900 dark:text-white">
          {displayEmail}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10 transition-colors duration-300">
          {emailSent ? (
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
                <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Email Sent Successfully!
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Please check your email inbox and click the verification link to complete the process.
              </p>
            </div>
          ) : (
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-4">
                <svg className="h-6 w-6 text-blue-600 dark:text-blue-400 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Sending Verification Email...
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Please wait while we send the verification email to your inbox.
              </p>
            </div>
          )}

          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400 dark:text-blue-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    What to do next:
                  </h3>
                  <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                    <ul className="list-disc list-inside space-y-1">
                      <li>Check your email inbox (and spam folder)</li>
                      <li>Click the verification link in the email</li>
                      <li>You'll be redirected to a success page</li>
                      <li>Return to your profile to see the updated status</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col space-y-3">
              <button
                onClick={handleResendEmail}
                disabled={isResending || loading || !displayEmail}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
              >
                {isResending ? 'Sending...' : 'Resend Verification Email'}
              </button>
              
              <button
                onClick={() => navigate('/profile')}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 hover:bg-green-100 dark:hover:bg-green-900/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Back to Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationPage;
