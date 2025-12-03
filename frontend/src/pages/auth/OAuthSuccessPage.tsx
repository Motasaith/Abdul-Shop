import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppDispatch } from '../../hooks/redux';
import { setCredentials } from '../../store/slices/authSlice';
import toast from 'react-hot-toast';

const OAuthSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (token) {
      // Decode token to get user info (simplified for now, ideally verify with backend or decode JWT)
      // For now, we just store the token and fetch user profile
      
      // We need to fetch the user details using the token
      // Since we don't have a direct action for just setting token and fetching user in one go easily exposed here without thunk,
      // we will manually set credentials and then the App's main useEffect or a specific fetch might handle it.
      // Actually, authSlice usually has a loadUser or similar.
      // Let's assume we can just set the token and then redirect to home where the app will fetch the user.
      
      // However, to be safe and consistent with authSlice, let's see if we can dispatch a login success action or similar.
      // Looking at authSlice (from memory/context), it likely has setCredentials or similar.
      
      // Let's try to fetch the user details immediately using the token
      const fetchUser = async () => {
        try {
          // Manually fetching user details
          const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
          const response = await fetch(`${API_URL}/api/auth/me`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const userData = await response.json();
            // Check if the response is wrapped in a 'data' property or returned directly
            // Based on auth.js: res.json(user) -> returns user object directly
            dispatch(setCredentials({ user: userData, token }));
            toast.success('Login successful!');
            navigate('/');
          } else {
            throw new Error('Failed to fetch user details');
          }
        } catch (error) {
          console.error('OAuth error:', error);
          toast.error('Login failed. Please try again.');
          navigate('/login');
        }
      };

      fetchUser();
    } else {
      toast.error('No token received');
      navigate('/login');
    }
  }, [searchParams, navigate, dispatch]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900">Completing login...</h2>
        <p className="text-gray-500">Please wait while we redirect you.</p>
      </div>
    </div>
  );
};

export default OAuthSuccessPage;
