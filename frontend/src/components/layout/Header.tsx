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

  // Fetch wishlist when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchWishlist());
    }
  }, [dispatch, isAuthenticated]);

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
          <div className="flex justify-between items-center text-sm">
            <span className="hidden sm:block">{t('common.freeShipping')} {formatPrice(50)}</span>
            <span className="sm:hidden">{t('common.freeShipping')} {formatPrice(50)}+</span>
            <div className="flex space-x-2 sm:space-x-4">
              <Link to="/help" className="hover:text-blue-200">{t('common.help')}</Link>
              <Link to="/track" className="hover:text-blue-200 hidden sm:inline">{t('common.trackOrder')}</Link>
              <Link to="/track" className="hover:text-blue-200 sm:hidden">{t('common.trackOrder')}</Link>
              <div className="flex items-center border-l border-blue-400 pl-4 ml-2 space-x-2">
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
            <Link to="/" className="text-2xl font-bold text-blue-600">
              {publicSettings?.siteName || 'ShopHub'}
            </Link>
          </div>

      {/* Search bar - Hidden on mobile, shown below */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <form onSubmit={handleSearch} className="relative w-full">
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

          {/* Right side icons */}
          <div className="flex items-center space-x-4">
            {/* Wishlist - Hidden on mobile */}
            <Link to="/wishlist" className="hidden sm:flex p-2 text-gray-700 hover:text-blue-600 transition-colors relative" title={t('common.wishlist')}>
              <HeartIcon className="h-6 w-6" />
              {isAuthenticated && wishlistItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {wishlistItemCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link to="/cart" className="p-2 text-gray-700 hover:text-blue-600 transition-colors relative" title={t('common.cart')}>
              <ShoppingCartIcon className="h-6 w-6" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
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
                    className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors focus:outline-none"
                  >
                    <UserIcon className="h-6 w-6" />
                    <span className="hidden lg:block font-medium">{user?.name}</span>
                  </button>

                  {/* Dropdown Menu */}
                  {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 z-50">
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        {t('common.profile')}
                      </Link>
                      <Link
                        to="/orders"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        {t('common.myOrders')}
                      </Link>
                      <Link
                        to="/reviews"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        {t('common.myReviews')}
                      </Link>
                      {user?.role === 'admin' && (
                        <Link
                          to="/admin"
                          className="block px-4 py-2 text-sm text-purple-600 hover:bg-gray-100"
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
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        {t('common.logout')}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link to="/login" className="text-gray-700 hover:text-blue-600 transition-colors">
                    {t('common.login')}
                  </Link>
                  <span className="text-gray-300">|</span>
                  <Link to="/register" className="text-gray-700 hover:text-blue-600 transition-colors">
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
                  className="text-gray-700 hover:text-blue-600 transition-colors text-sm"
                >
                  {t(`categories.${category}`)}
                </Link>
              ))}
            </nav>
            <div className="flex items-center space-x-4 text-sm">
              <Link to="/sales" className="text-red-600 font-medium hover:text-red-700">
                {t('common.todaysDeals')}
              </Link>
              <Link to="/new-arrivals" className="text-green-600 font-medium hover:text-green-700">
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
