import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { logout } from '../../store/slices/authSlice';
import { fetchWishlist, selectWishlistItemCount } from '../../store/slices/wishlistSlice';
import { 
  ShoppingBag, 
  User, 
  Search, 
  Menu, 
  X, 
  Heart, 
  LogOut, 
  Settings, 
  LayoutDashboard, 
  Package, 
  MessageSquare, 
  Star,
  ChevronDown
} from 'lucide-react';
import CurrencySelector from '../common/CurrencySelector';
import LanguageSelector from '../common/LanguageSelector';
import ThemeToggle from '../common/ThemeToggle';
import { usePrice } from '../../hooks/usePrice';
import { useTranslation } from '../../hooks/useTranslation';
import { AnimatePresence, motion } from 'framer-motion';

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
  const [scrolled, setScrolled] = useState(false);

  /* Animation State */
  const [isBumping, setIsBumping] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    setIsProfileMenuOpen(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setIsMenuOpen(false);
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
    <header 
      className={`fixed w-full top-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-lg border-b border-gray-200/50 dark:border-gray-700/50' 
          : 'bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800'
      }`}
    >
      {/* Top bar - Consolidated & Sleek */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-1.5 relative z-[60]">
        <div className="absolute inset-0 bg-white/5 pattern-grid-lg opacity-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex justify-between items-center text-xs font-medium tracking-wide">
            <span className="hidden sm:flex items-center gap-2">
              <span className="bg-white/20 px-2 py-0.5 rounded-full">Free Shipping</span>
              <span className="opacity-90">On orders over {formatPrice(50)}</span>
            </span>
            <div className="flex justify-end w-full sm:w-auto items-center gap-4">
              <div className="hidden sm:flex items-center gap-4 border-r border-white/20 pr-4">
                <Link to="/help" className="hover:text-blue-100 transition-colors">{t('common.help')}</Link>
                <Link to="/register/vendor" className="hidden lg:block hover:text-blue-100 transition-colors">Sell on ShopHub</Link>
                <Link to="/track" className="hover:text-blue-100 transition-colors">{t('common.trackOrder')}</Link>
              </div>
              <div className="flex items-center gap-3">
                <CurrencySelector variant="header" />
                <LanguageSelector />
                <ThemeToggle />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20 gap-8">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0 group">
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 leading-none group-hover:scale-105 transition-transform duration-200">
              {publicSettings?.siteName || 'ShopHub'}
            </h1>
          </Link>

          {/* Search bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-2xl relative z-20">
            <form onSubmit={handleSearch} className="w-full relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('common.searchPlaceholder')}
                className="block w-full pl-11 pr-4 py-2.5 bg-gray-100 dark:bg-gray-800 border-none rounded-full text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white dark:focus:bg-gray-900 transition-all shadow-sm group-hover:shadow-md"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-full text-xs font-semibold transition-all shadow-sm active:scale-95"
              >
                {t('common.search')}
              </button>
            </form>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Wishlist */}
            <Link 
              to="/wishlist" 
              className="flex relative p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-all hover:text-red-500 dark:hover:text-red-400 group"
              title={t('common.wishlist')}
            >
              <Heart className="h-5 w-5 transition-transform group-hover:scale-110" />
              <AnimatePresence>
                {isAuthenticated && wishlistItemCount > 0 && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute top-1.5 right-1.5 bg-red-500 text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full ring-2 ring-white dark:ring-gray-900"
                  >
                    {wishlistItemCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>

            {/* Cart */}
            <Link 
              to="/cart" 
              className="relative p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-all hover:text-blue-600 dark:hover:text-blue-400 group"
              title={t('common.cart')}
            >
              <motion.div
                animate={isBumping ? { rotate: [0, -10, 10, -10, 10, 0] } : {}}
              >
                <ShoppingBag className="h-5 w-5 transition-transform group-hover:scale-110" />
              </motion.div>
              <AnimatePresence>
                {totalItems > 0 && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute top-1.5 right-1.5 bg-blue-600 text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full ring-2 ring-white dark:ring-gray-900"
                  >
                    {totalItems}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>

            {/* Profile Dropdown */}
            <div className="relative hidden md:block">
              {isAuthenticated ? (
                <div className="relative">
                  <button 
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center gap-2 p-1.5 pr-3 rounded-full border border-gray-200 dark:border-gray-700 hover:border-blue-500/50 hover:shadow-sm transition-all ml-2 group"
                  >
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-inner">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200 max-w-[100px] truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {user?.name}
                    </span>
                    <ChevronDown className={`h-3 w-3 text-gray-400 transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {isProfileMenuOpen && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 py-2 z-50 overflow-hidden"
                      >
                         <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/50">
                          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">Signed in as</p>
                          <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user?.email}</p>
                        </div>
                        
                        <div className="p-2">
                           {user?.role === 'admin' && (
                            <Link to="/admin" onClick={() => setIsProfileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors mb-1">
                              <LayoutDashboard className="h-4 w-4" />
                              Admin Dashboard
                            </Link>
                          )}
                          {user?.role === 'vendor' && (
                            <Link to="/vendor/dashboard" onClick={() => setIsProfileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors mb-1">
                              <LayoutDashboard className="h-4 w-4" />
                              Vendor Dashboard
                            </Link>
                          )}
                          
                          <Link to="/profile" onClick={() => setIsProfileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl transition-colors">
                            <User className="h-4 w-4" />
                            {t('common.profile')}
                          </Link>
                          <Link to="/orders" onClick={() => setIsProfileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl transition-colors">
                            <Package className="h-4 w-4" />
                            {t('common.myOrders')}
                          </Link>
                           <Link to="/wishlist" onClick={() => setIsProfileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl transition-colors">
                            <Heart className="h-4 w-4" />
                            {t('common.wishlist')}
                          </Link>
                          <Link to="/profile/tickets" onClick={() => setIsProfileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl transition-colors">
                            <MessageSquare className="h-4 w-4" />
                            {t('support.myTickets')}
                          </Link>
                          <Link to="/reviews" onClick={() => setIsProfileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl transition-colors">
                            <Star className="h-4 w-4" />
                            {t('common.myReviews')}
                          </Link>
                        </div>

                        <div className="border-t border-gray-100 dark:border-gray-700 p-2">
                          <button
                            onClick={handleLogout}
                            className="flex w-full items-center gap-3 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                          >
                            <LogOut className="h-4 w-4" />
                            {t('common.logout')}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex items-center gap-3 ml-4">
                  <Link to="/login" className="text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    {t('common.login')}
                  </Link>
                  <Link to="/register" className="px-4 py-2 text-sm font-bold text-white bg-blue-600 rounded-full hover:bg-blue-700 shadow-md hover:shadow-lg transition-all active:scale-95">
                    {t('common.register')}
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Categories */}
      <div className="hidden md:block border-t border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-12">
            <nav className="flex space-x-8">
              {categories.map((category) => (
                <Link
                  key={category}
                  to={`/products?category=${category}`}
                  className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-3 border-b-2 border-transparent hover:border-blue-600"
                >
                  {t(`categories.${category}`)}
                </Link>
              ))}
            </nav>
            <div className="flex items-center gap-6 text-sm font-medium">
              <Link to="/sales" className="text-rose-500 hover:text-rose-600 transition-colors flex items-center gap-1">
                {t('common.todaysDeals')}
              </Link>
              <Link to="/new-arrivals" className="text-emerald-500 hover:text-emerald-600 transition-colors">
                {t('common.newArrivals')}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-xl overflow-y-auto max-h-[85vh]"
          >
            <div className="px-4 py-4 space-y-4">
              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('common.searchPlaceholder')}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-100 dark:bg-gray-800 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/50 dark:text-white"
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              </form>

              {/* Mobile Profile Link */}
              {isAuthenticated ? (
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3">
                  <div className="flex items-center gap-3 mb-3" onClick={() => {
                    navigate('/profile');
                    setIsMenuOpen(false);
                  }}>
                    <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 dark:text-white">{user?.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                    </div>
                  </div>
                  
                  {/* Mobile Profile Links */}
                  <div className="grid grid-cols-1 gap-1 pl-2">
                     {user?.role === 'admin' && (
                        <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 py-2 text-sm font-medium text-blue-600 dark:text-blue-400">
                          <LayoutDashboard className="h-4 w-4" />
                          Admin Dashboard
                        </Link>
                      )}
                      {user?.role === 'vendor' && (
                        <Link to="/vendor/dashboard" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 py-2 text-sm font-medium text-purple-600 dark:text-purple-400">
                          <LayoutDashboard className="h-4 w-4" />
                          Vendor Dashboard
                        </Link>
                      )}
                      <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 py-2 text-sm text-gray-600 dark:text-gray-300">
                        <User className="h-4 w-4" />
                        {t('common.profile')}
                      </Link>
                      <Link to="/orders" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 py-2 text-sm text-gray-600 dark:text-gray-300">
                        <Package className="h-4 w-4" />
                        {t('common.myOrders')}
                      </Link>
                      <Link to="/wishlist" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 py-2 text-sm text-gray-600 dark:text-gray-300">
                        <Heart className="h-4 w-4" />
                        {t('common.wishlist')}
                      </Link>
                      <Link to="/profile/tickets" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 py-2 text-sm text-gray-600 dark:text-gray-300">
                        <MessageSquare className="h-4 w-4" />
                        {t('support.myTickets')}
                      </Link>
                      <Link to="/reviews" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 py-2 text-sm text-gray-600 dark:text-gray-300">
                        <Star className="h-4 w-4" />
                        {t('common.myReviews')}
                      </Link>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Link to="/login" onClick={() => setIsMenuOpen(false)} className="flex justify-center py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800">
                    {t('common.login')}
                  </Link>
                  <Link to="/register" onClick={() => setIsMenuOpen(false)} className="flex justify-center py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700">
                    {t('common.register')}
                  </Link>
                </div>
              )}

              {/* Mobile Links */}
              <div className="space-y-1">
                <p className="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Shop</p>
                {categories.map((category) => (
                  <Link
                    key={category}
                    to={`/products?category=${category}`}
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-2 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg text-sm font-medium"
                  >
                    {t(`categories.${category}`)}
                  </Link>
                ))}
              </div>

              <div className="border-t border-gray-100 dark:border-gray-800 pt-4 space-y-1">
                <Link to="/sales" onClick={() => setIsMenuOpen(false)} className="block px-2 py-2 text-rose-500 font-medium text-sm">
                  {t('common.todaysDeals')}
                </Link>
                <Link to="/new-arrivals" onClick={() => setIsMenuOpen(false)} className="block px-2 py-2 text-emerald-500 font-medium text-sm">
                  {t('common.newArrivals')}
                </Link>
                <Link to="/help" onClick={() => setIsMenuOpen(false)} className="block px-2 py-2 text-gray-600 dark:text-gray-300 font-medium text-sm">
                  {t('common.help')}
                </Link>
                <Link to="/register/vendor" onClick={() => setIsMenuOpen(false)} className="block px-2 py-2 text-gray-600 dark:text-gray-300 font-medium text-sm">
                  Sell on ShopHub
                </Link>
                <Link to="/track" onClick={() => setIsMenuOpen(false)} className="block px-2 py-2 text-gray-600 dark:text-gray-300 font-medium text-sm">
                  {t('common.trackOrder')}
                </Link>
                {isAuthenticated && (
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-2 py-2 text-red-600 font-medium text-sm"
                  >
                    {t('common.logout')}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
