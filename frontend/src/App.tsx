import React, { useEffect } from 'react';
// Force HMR update 2
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { Toaster } from 'react-hot-toast';
import { store, persistor } from './store';
import { useAppDispatch, useAppSelector } from './hooks/redux';
import { getCurrentUser, logout } from './store/slices/authSlice';
import { getPublicSettings } from './store/slices/settingSlice';
import { fetchRates } from './store/slices/preferenceSlice';
import { apiService } from './services/api';
import { ThemeProvider } from './context/ThemeProvider';

// Layout Components
import Layout from './components/layout/Layout';
import AdminLayout from './components/layout/AdminLayout';
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminRoute from './components/common/AdminRoute';
import ScrollToTop from './components/common/ScrollToTop';

// Pages
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import LoginPage from './pages/auth/LoginPage';
import OAuthSuccessPage from './pages/auth/OAuthSuccessPage';
import RegisterPage from './pages/auth/RegisterPage';
import VendorRegisterPage from './pages/auth/VendorRegisterPage';
import VerifyPhonePage from './pages/auth/VerifyPhonePage';
import EmailVerificationPage from './pages/EmailVerificationPage';
import EmailVerificationSuccessPage from './pages/EmailVerificationSuccessPage';
import PhoneVerificationPage from './pages/PhoneVerificationPage';
import PasswordResetPage from './pages/PasswordResetPage';
import ProfilePage from './pages/ProfilePage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import MyReviewsPage from './pages/MyReviewsPage';
import NotFoundPage from './pages/NotFoundPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import HelpPage from './pages/HelpPage';
import ReturnsPage from './pages/ReturnsPage';
import TrackOrderPage from './pages/TrackOrderPage';
import WishlistPage from './pages/WishlistPage';
import ShippingPage from './pages/ShippingPage';
import SizeGuidePage from './pages/SizeGuidePage';
import PressPage from './pages/PressPage';
import BlogPage from './pages/BlogPage';
import CareersPage from './pages/CareersPage';
import NewArrivalsPage from './pages/NewArrivalsPage';
import SalesPage from './pages/SalesPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminUsers from './pages/admin/AdminUsers';
import AdminNewsletter from './pages/admin/AdminNewsletter';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminSettings from './pages/admin/AdminSettings';
import PaymentSettings from './pages/admin/PaymentSettings';
import AdminNotifications from './pages/admin/AdminNotifications';
import AdminSupportPage from './pages/admin/AdminSupportPage';
import AdminSupportDetailPage from './pages/admin/AdminSupportDetailPage';
import AdminVendorRequests from './pages/admin/AdminVendorRequests';

// User Support Pages
import SupportTicketListPage from './pages/profile/SupportTicketListPage';
import SupportTicketDetailPage from './pages/profile/SupportTicketDetailPage';
import VendorDashboard from './pages/vendor/VendorDashboard';
import VendorProductForm from './pages/vendor/VendorProductForm';

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
  </div>
);

// App component with authentication check
function AppContent() {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Setup API interceptor logout callback
    apiService.setLogoutCallback(() => {
      dispatch(logout());
    });

    // Fetch public settings
    dispatch(getPublicSettings());
    // Fetch currency rates
    dispatch(fetchRates());

    const token = localStorage.getItem('token');
    if (token) {
      dispatch(getCurrentUser());
    } else if (isAuthenticated) {
      // If no token but state says authenticated, logout
      dispatch(logout());
    }
  }, [dispatch, isAuthenticated]);

  return (
    <Router>
<ScrollToTop />
        <div className="App">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="products/:id" element={<ProductDetailPage />} />
            <Route path="cart" element={<CartPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="oauth-success" element={<OAuthSuccessPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="register/vendor" element={<VendorRegisterPage />} />
            <Route path="verify-phone" element={<VerifyPhonePage />} />
            <Route path="email-verification" element={<EmailVerificationPage />} />
            <Route path="verify-email" element={<EmailVerificationSuccessPage />} />
            <Route path="phone-verification" element={<PhoneVerificationPage />} />
            <Route path="reset-password" element={<PasswordResetPage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="help" element={<HelpPage />} />
            <Route path="returns" element={<ReturnsPage />} />
            <Route path="track" element={<TrackOrderPage />} />
            <Route path="track/:trackingNumber" element={<TrackOrderPage />} />
            <Route path="shipping" element={<ShippingPage />} />
            <Route path="size-guide" element={<SizeGuidePage />} />
            <Route path="press" element={<PressPage />} />
            <Route path="blog" element={<BlogPage />} />
            <Route path="careers" element={<CareersPage />} />
            <Route path="new-arrivals" element={<NewArrivalsPage />} />
            <Route path="sales" element={<SalesPage />} />
          </Route>

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="checkout" element={<CheckoutPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="orders/:id" element={<OrderDetailPage />} />
            <Route path="reviews" element={<MyReviewsPage />} />
            <Route path="wishlist" element={<WishlistPage />} />
            <Route path="profile/tickets" element={<SupportTicketListPage />} />
            <Route path="profile/tickets/:id" element={<SupportTicketDetailPage />} />
            <Route path="vendor/dashboard" element={<VendorDashboard />} />
            <Route path="vendor/dashboard" element={<VendorDashboard />} />
            <Route path="products/new" element={<VendorProductForm />} />
            <Route path="products/edit/:id" element={<VendorProductForm />} />
          </Route>

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="vendors/requests" element={<AdminVendorRequests />} />
            <Route path="newsletter" element={<AdminNewsletter />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="settings/payments" element={<PaymentSettings />} />
            <Route path="notifications" element={<AdminNotifications />} />
            <Route path="support" element={<AdminSupportPage />} />
            <Route path="support/:id" element={<AdminSupportDetailPage />} />
          </Route>

          {/* 404 Page */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>

        {/* Toast notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
      </div>
    </Router>
  );
}

// Main App component with Redux Provider
function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={<LoadingSpinner />} persistor={persistor}>
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </PersistGate>
    </Provider>
  );
}

export default App;
