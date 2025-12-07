import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { logout } from '../../store/slices/authSlice';
import { fetchWishlist, selectWishlistItemCount } from '../../store/slices/wishlistSlice';
import { 
  ShoppingCartIcon, 
  UserIcon, 
  MagnifyingGlassIcon,
  Bars3Icon,
  XMarkIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import CurrencySelector from '../common/CurrencySelector';
import LanguageSelector from '../common/LanguageSelector';
import { usePrice } from '../../hooks/usePrice';
import { useTranslation } from '../../hooks/useTranslation';

const Header: React.FC = () => {
  const { formatPrice } = usePrice();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { totalItems } = useAppSelector((state) => state.cart);
  const { publicSettings } = useAppSelector((state) => state.settings);
  const wishlistItemCount = useAppSelector(selectWishlistItemCount);
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  /* Animation State */
  const [isBumping, setIsBumping] = useState(false);

  // Fetch wishlist when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchWishlist());
    }
  }, [dispatch, isAuthenticated]);

  // Cart Bump Animation
  useEffect(() => {
    if (totalItems === 0) return;
    setIsBumping(true);
    const timer = setTimeout(() => setIsBumping(false), 300);
    return () => clearTimeout(timer);
  }, [totalItems]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const categories = [
    'Electronics',
    'Clothing',
    'Books',
    'Home & Garden',
    'Sports',
    'Beauty',
    'Health',
    'Toys',
    'Automotive'
  ];

  return (
    <header className="bg-white shadow-md fixed w-full top-0 z-50">
      {/* Top bar */}
      <div className="bg-blue-600 text-white py-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-end sm:justify-between items-center text-sm">
            <span className="hidden sm:block">{t('common.freeShipping')} {formatPrice(50)}</span>
            <div className="flex justify-end w-full sm:w-auto items-center space-x-2 sm:space-x-4">
              <Link to="/help" className="hidden sm:inline hover:text-blue-200">{t('common.help')}</Link>
              <Link to="/register/vendor" className="hidden sm:inline hover:text-blue-200 font-medium">Sell on ShopHub</Link>
              <Link to="/track" className="hidden sm:inline hover:text-blue-200">{t('common.trackOrder')}</Link>
              <div className="flex items-center sm:border-l sm:border-blue-400 sm:pl-4 sm:ml-2 space-x-2">
                <CurrencySelector />
                <LanguageSelector />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition-all duration-300 transform hover:scale-105">
              {publicSettings?.siteName || 'ShopHub'}
            </Link>
          </div>

          {/* Search bar - Hidden on mobile, shown below */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <form onSubmit={handleSearch} className="relative w-full group">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('common.searchPlaceholder')}
                className="w-full px-4 py-2 pl-10 pr-16 text-gray-900 bg-gray-100 border border-transparent rounded-full focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:shadow-lg transition-all duration-300 ease-in-out"
              />
              <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors duration-300" />
              <button
                type="submit"
                className="absolute right-2 top-1.5 bg-blue-600 text-white px-4 py-1 rounded-full text-sm hover:bg-blue-700 active:scale-95 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                {t('common.search')}
              </button>
            </form>
          </div>

          {/* Right side icons */}
          <div className="flex items-center space-x-4">
            {/* Wishlist - Hidden on mobile */}
            <Link to="/wishlist" className="hidden sm:flex p-2 text-gray-700 hover:text-red-500 transition-colors duration-300 transform hover:scale-110 relative" title={t('common.wishlist')}>
              <HeartIcon className="h-6 w-6" />
              {isAuthenticated && wishlistItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-scale-in shadow-sm">
                  {wishlistItemCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link 
              to="/cart" 
              className={`p-2 text-gray-700 hover:text-blue-600 transition-colors duration-300 transform hover:scale-110 relative ${isBumping ? 'animate-shake' : ''}`} 
              title={t('common.cart')}
            >
              <ShoppingCartIcon className="h-6 w-6" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-scale-in shadow-sm">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* User menu */}
            <div className="relative hidden md:block">
              {isAuthenticated ? (
                <div className="relative">
                  <button 
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors focus:outline-none group"
                  >
                    <UserIcon className="h-6 w-6 transform group-hover:scale-110 transition-transform duration-300" />
                    <span className="hidden lg:block font-medium group-hover:underline decoration-blue-500 underline-offset-4 decoration-2">{user?.name}</span>
                  </button>

                  {/* Dropdown Menu */}
                  {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 z-50 animate-fade-in origin-top-right">
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition-colors"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        {t('common.profile')}
                      </Link>
                      {/* ... other links ... */}
                      <Link
                        to="/orders"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition-colors"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        {t('common.myOrders')}
                      </Link>
                      <Link
                        to="/profile/tickets"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition-colors"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        {t('support.myTickets')}
                      </Link>
                      <Link
                        to="/reviews"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition-colors"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        {t('common.myReviews')}
                      </Link>
                      {user?.role === 'vendor' && (
                        <Link
                          to="/vendor/dashboard"
                          className="block px-4 py-2 text-sm text-blue-600 hover:bg-gray-100 hover:text-blue-700 transition-colors"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          Vendor Dashboard
                        </Link>
                      )}
                      {user?.role === 'admin' && (
                        <Link
                          to="/admin"
                          className="block px-4 py-2 text-sm text-purple-600 hover:bg-gray-100 hover:text-purple-700 transition-colors"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          {t('common.adminDashboard')}
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsProfileMenuOpen(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-red-600 transition-colors"
                      >
                        {t('common.logout')}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link to="/login" className="text-gray-700 hover:text-blue-600 transition-colors font-medium hover:underline decoration-2 underline-offset-4">
                    {t('common.login')}
                  </Link>
                  <span className="text-gray-300">|</span>
                  <Link to="/register" className="text-gray-700 hover:text-blue-600 transition-colors font-medium hover:underline decoration-2 underline-offset-4">
                    {t('common.register')}
                  </Link>
                </div>
              )}
            </div>
            
            {/* Mobile User Icon */}
            <div className="md:hidden">
              {isAuthenticated ? (
                <Link to="/profile" className="p-2 text-gray-700 hover:text-blue-600 transition-colors">
                  <UserIcon className="h-6 w-6" />
                </Link>
              ) : (
                <Link to="/login" className="p-2 text-gray-700 hover:text-blue-600 transition-colors">
                  <UserIcon className="h-6 w-6" />
                </Link>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-700 hover:text-blue-600 transition-colors"
            >
              {isMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Categories navigation */}
      <div className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-12">
            <nav className="hidden md:flex space-x-8">
              {categories.map((category) => (
                <Link
                  key={category}
                  to={`/products?category=${category}`}
                  className="text-gray-700 hover:text-blue-600 transition-colors text-sm font-medium relative group"
                >
                  {t(`categories.${category}`)}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
                </Link>
              ))}
            </nav>
            <div className="flex items-center space-x-4 text-sm">
              <Link to="/sales" className="text-red-600 font-medium hover:text-red-700 hover:underline decoration-2 underline-offset-4 transition-all">
                {t('common.todaysDeals')}
              </Link>
              <Link to="/new-arrivals" className="text-green-600 font-medium hover:text-green-700 hover:underline decoration-2 underline-offset-4 transition-all">
                {t('common.newArrivals')}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          {/* Mobile search */}
          <div className="px-4 py-3 border-b border-gray-200">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('common.searchPlaceholder')}
                className="w-full px-4 py-2 pl-10 pr-16 text-gray-900 bg-gray-100 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <button
                type="submit"
                className="absolute right-2 top-1.5 bg-blue-600 text-white px-4 py-1 rounded-full text-sm hover:bg-blue-700 transition-colors"
              >
                {t('common.search')}
              </button>
            </form>
          </div>
          
          {/* Mobile General Links (Added Help/Track here for mobile) */}
          <div className="px-4 py-2 border-b border-gray-200 bg-gray-50">
             <Link
               to="/help"
               className="block py-2 text-sm text-gray-700 hover:text-blue-600"
               onClick={() => setIsMenuOpen(false)}
             >
               {t('common.help')}
             </Link>
             <Link
               to="/track"
               className="block py-2 text-sm text-gray-700 hover:text-blue-600"
               onClick={() => setIsMenuOpen(false)}
             >
               {t('common.trackOrder')}
             </Link>
          </div>
          
          {/* Mobile user menu */}
          {isAuthenticated && (
            <div className="px-4 py-2 border-b border-gray-200">
              <div className="flex items-center space-x-2 mb-2">
                <UserIcon className="h-5 w-5 text-gray-600" />
                <span className="font-medium text-gray-900">{user?.name}</span>
              </div>
              <div className="space-y-1">
                <Link
                  to="/profile"
                  className="block py-1 text-sm text-gray-700 hover:text-blue-600 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('common.profile')}
                </Link>
                <Link
                  to="/orders"
                  className="block py-1 text-sm text-gray-700 hover:text-blue-600 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('common.myOrders')}
                </Link>
                <Link
                  to="/profile/tickets"
                  className="block py-1 text-sm text-gray-700 hover:text-blue-600 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('support.myTickets')}
                </Link>
                <Link
                  to="/wishlist"
                  className="block py-1 text-sm text-gray-700 hover:text-blue-600 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('common.wishlist')}
                </Link>
                <Link
                  to="/reviews"
                  className="block py-1 text-sm text-gray-700 hover:text-blue-600 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('common.myReviews')}
                </Link>
                {user?.role === 'vendor' && (
                  <Link
                    to="/vendor/dashboard"
                    className="block py-1 text-sm text-blue-600 hover:text-blue-700 transition-colors font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Vendor Dashboard
                  </Link>
                )}
                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="block py-1 text-sm text-purple-600 hover:text-purple-700 transition-colors font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t('common.adminDashboard')}
                  </Link>
                )}
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="block py-1 text-sm text-gray-700 hover:text-blue-600 transition-colors"
                >
                  {t('common.logout')}
                </button>
              </div>
            </div>
          )}
          
          {/* Mobile auth links for non-authenticated users */}
          {!isAuthenticated && (
            <div className="px-4 py-2 border-b border-gray-200">
              <div className="flex space-x-4">
                <Link
                  to="/login"
                  className="block py-2 text-gray-700 hover:text-blue-600 transition-colors font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('common.login')}
                </Link>
                <Link
                  to="/register"
                  className="block py-2 text-gray-700 hover:text-blue-600 transition-colors font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('common.register')}
                </Link>
              </div>
            </div>
          )}
          
          {/* Mobile categories */}
          <div className="px-4 py-2 space-y-2">
            <div className="text-sm font-medium text-gray-900 mb-2">{t('common.categories')}</div>
            {categories.map((category) => (
              <Link
                key={category}
                to={`/products?category=${category}`}
                className="block py-2 text-gray-700 hover:text-blue-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {t(`categories.${category}`)}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
