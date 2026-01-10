import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { verifyPhone, resendPhoneVerification, clearError } from '../../store/slices/authSlice';
import toast from 'react-hot-toast';

const VerifyPhonePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, error, user } = useAppSelector((state) => state.auth);

  // Get phone number and dev code from location state or user
  const phoneNumber = location.state?.phoneNumber || user?.phone || '';
  const devCode = location.state?.devCode || '';

  const [verificationCode, setVerificationCode] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [canResend, setCanResend] = useState(false);
  const [currentDevCode, setCurrentDevCode] = useState(devCode);

  // Redirect if no phone number or already verified
  useEffect(() => {
    if (!phoneNumber) {
      toast.error('No phone number found. Please register again.');
      navigate('/register');
      return;
    }
    
    if (user?.phoneVerified) {
      toast.success('Phone already verified!');
      navigate('/');
      return;
    }
  }, [phoneNumber, user, navigate]);

  // Timer for countdown
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  // Handle errors
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleVerify = async (e: React.FormEvent) => {
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
      navigate('/');
    } catch (error: any) {
      // Error handled by useEffect above
    }
  };

  const handleResendCode = async () => {
    setResendLoading(true);
    try {
      const result = await dispatch(resendPhoneVerification()).unwrap();
      toast.success('New verification code sent!');
      setTimeLeft(600); // Reset timer
      setCanResend(false);
      // Update dev code if provided
      if (result.devCode) {
        setCurrentDevCode(result.devCode);
      }
    } catch (error: any) {
      // Error handled by useEffect above
    } finally {
      setResendLoading(false);
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Only allow digits
    if (value.length <= 6) {
      setVerificationCode(value);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100">
            <svg
              className="h-6 w-6 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Verify Your Phone Number
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            We've sent a 6-digit verification code to:
          </p>
          <p className="text-center text-sm font-medium text-gray-900 dark:text-gray-300 mt-1">
            {phoneNumber}
          </p>
          <p className="mt-2 text-center text-xs text-gray-500 dark:text-gray-500">
            Code expires in: <span className="font-medium text-red-600 dark:text-red-400">{formatTime(timeLeft)}</span>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleVerify}>
          <div>
            <label htmlFor="verification-code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Verification Code
            </label>
            <input
              id="verification-code"
              type="text"
              value={verificationCode}
              onChange={handleCodeChange}
              placeholder="Enter 6-digit code"
              className="appearance-none relative block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-md text-center text-2xl font-mono tracking-widest focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 dark:bg-gray-700"
              maxLength={6}
              autoComplete="one-time-code"
              autoFocus
              required
            />
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
              Enter the 6-digit code sent to your phone
            </p>
          </div>

          <div className="space-y-4">
            <button
              type="submit"
              disabled={loading || verificationCode.length !== 6}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Verifying...
                </div>
              ) : (
                'Verify Phone Number'
              )}
            </button>

            <button
              type="button"
              onClick={handleResendCode}
              disabled={resendLoading || !canResend}
              className="w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-700 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resendLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                  Sending...
                </div>
              ) : canResend ? (
                'Resend Code'
              ) : (
                `Resend in ${formatTime(timeLeft)}`
              )}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Need help?{' '}
              <Link to="/contact" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
                Contact Support
              </Link>
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Wrong number?{' '}
              <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
                Register Again
              </Link>
            </p>
          </div>
        </form>

        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">
                Didn't receive the code?
              </h3>
              <div className="mt-2 text-sm text-blue-700 dark:text-blue-400">
                <ul className="list-disc pl-5 space-y-1">
                  <li>Check your phone's message inbox</li>
                  <li>The code may take up to 2 minutes to arrive</li>
                  <li>Make sure your phone has good signal</li>
                  <li>Try resending the code if it doesn't arrive</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Development Mode Info with Code Display */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                  Development Mode
                </h3>
                <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-400">
                  <p>Free SMS APIs may only work in test mode. Your verification code:</p>
                  {currentDevCode && (
                    <div className="mt-3 p-3 bg-yellow-100 dark:bg-yellow-900/40 border border-yellow-300 dark:border-yellow-700 rounded-md">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-mono font-bold text-yellow-900 dark:text-yellow-200">
                          {currentDevCode}
                        </span>
                        <button
                          onClick={() => setVerificationCode(currentDevCode)}
                          className="text-xs bg-yellow-200 hover:bg-yellow-300 px-2 py-1 rounded transition-colors"
                        >
                          Use This Code
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyPhonePage;
