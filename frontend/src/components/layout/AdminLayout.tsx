import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { logout } from '../../store/slices/authSlice';
import {
  HomeIcon,
  ShoppingBagIcon,
  ShoppingCartIcon,
  UsersIcon,
  ChartBarIcon,
  CogIcon,
  EnvelopeIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowLeftOnRectangleIcon,
  BellIcon,
  UserIcon,
  ChatBubbleLeftRightIcon,
  BuildingStorefrontIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  ShoppingBagIcon as ShoppingBagIconSolid,
  ShoppingCartIcon as ShoppingCartIconSolid,
  UsersIcon as UsersIconSolid,
  ChartBarIcon as ChartBarIconSolid,
  CogIcon as CogIconSolid,
  EnvelopeIcon as EnvelopeIconSolid,
  ChatBubbleLeftRightIcon as ChatBubbleLeftRightIconSolid,
  BuildingStorefrontIcon as BuildingStorefrontIconSolid
} from '@heroicons/react/24/solid';

import notificationService from '../../services/notificationService';
import CurrencySelector from '../common/CurrencySelector';

const AdminLayout: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAppSelector((state) => state.auth);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  React.useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const data = await notificationService.getNotifications(1, 1);
        setUnreadCount(data.unreadCount);
      } catch (error) {
        console.error('Error fetching unread notifications:', error);
      }
    };

    fetchUnreadCount();
    // Poll every 60 seconds
    const interval = setInterval(fetchUnreadCount, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const navigation = [
    { 
      name: 'Dashboard', 
      href: '/admin', 
      icon: HomeIcon, 
      iconSolid: HomeIconSolid,
      description: 'Overview & stats'
    },
    { 
      name: 'Products', 
      href: '/admin/products', 
      icon: ShoppingBagIcon, 
      iconSolid: ShoppingBagIconSolid,
      description: 'Manage inventory'
    },
    { 
      name: 'Orders', 
      href: '/admin/orders', 
      icon: ShoppingCartIcon, 
      iconSolid: ShoppingCartIconSolid,
      description: 'Order management'
    },
    { 
      name: 'Users', 
      href: '/admin/users', 
      icon: UsersIcon, 
      iconSolid: UsersIconSolid,
      description: 'User accounts'
    },
    { 
      name: 'Vendor Requests', 
      href: '/admin/vendors/requests', 
      icon: BuildingStorefrontIcon, 
      iconSolid: BuildingStorefrontIconSolid,
      description: 'Approve new vendors'
    },
    { 
      name: 'Newsletter', 
      href: '/admin/newsletter', 
      icon: EnvelopeIcon, 
      iconSolid: EnvelopeIconSolid,
      description: 'Email campaigns'
    },
    { 
      name: 'Analytics', 
      href: '/admin/analytics', 
      icon: ChartBarIcon, 
      iconSolid: ChartBarIconSolid,
      description: 'Reports & insights'
    },
    { 
      name: 'Notifications', 
      href: '/admin/notifications', 
      icon: BellIcon, 
      iconSolid: BellIcon,
      description: 'System alerts'
    },
    { 
      name: 'Support', 
      href: '/admin/support', 
      icon: ChatBubbleLeftRightIcon, 
      iconSolid: ChatBubbleLeftRightIconSolid,
      description: 'User tickets'
    },
    { 
      name: 'Settings', 
      href: '/admin/settings', 
      icon: CogIcon, 
      iconSolid: CogIconSolid,
      description: 'System config'
    },
    { 
      name: 'Payment Config', 
      href: '/admin/settings/payments', 
      icon: CogIcon, 
      iconSolid: CogIconSolid,
      description: 'Payment Gateways'
    },
  ];

  const isCurrentPath = (path: string) => {
    return location.pathname === path || (path === '/admin' && location.pathname === '/admin');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      {/* Mobile menu backdrop */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-900/80" onClick={() => setSidebarOpen(false)}></div>
        
        {/* Mobile sidebar */}
        <div className="fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-gray-800 shadow-xl transition-colors duration-300">
          <div className="flex h-full flex-col">
            {/* Mobile sidebar header */}
            <div className="flex h-16 items-center justify-between bg-gradient-to-r from-blue-600 to-blue-700 px-6">
              <div className="flex items-center space-x-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
                  <span className="text-lg font-bold text-white">S</span>
                </div>
                <h1 className="text-lg font-semibold text-white">ShopHub Admin</h1>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-white/80 hover:bg-white/10 hover:text-white"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            
            {/* Mobile navigation */}
            <nav className="flex-1 space-y-1 px-4 py-6 overflow-y-auto min-h-0">
              {navigation.map((item) => {
                const isActive = isCurrentPath(item.href);
                const Icon = isActive ? item.iconSolid : item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`group flex items-center rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 shadow-sm'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <div className="relative">
                      <Icon className={`mr-3 h-5 w-5 flex-shrink-0 ${
                        isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'
                      }`} />
                      {item.name === 'Notifications' && unreadCount > 0 && (
                        <span className="absolute -top-1 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-xs text-gray-500">{item.description}</div>
                    </div>
                  </Link>
                );
              })}
            </nav>

            {/* Currency Selector (Mobile) */}
            <div className="border-t border-gray-200 p-4">
              <CurrencySelector />
            </div>

            {/* Back to Website (Mobile) */}
            <div className="border-t border-gray-200 p-4 pb-0">
              <Link
                to="/"
                onClick={() => setSidebarOpen(false)}
                className="flex w-full items-center justify-center rounded-lg bg-white border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
              >
                <GlobeAltIcon className="mr-2 h-5 w-5 text-gray-400" />
                Return to Website
              </Link>
            </div>
            
            {/* Mobile user info */}
            <div className="p-4">
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                  <UserIcon className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                  title="Logout"
                >
                  <ArrowLeftOnRectangleIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
        <div className="flex h-full flex-col bg-white dark:bg-gray-800 shadow-xl overflow-hidden transition-colors duration-300">
          {/* Desktop sidebar header */}
          <div className="flex h-16 items-center bg-gradient-to-r from-blue-600 to-blue-700 px-6">
            <div className="flex items-center space-x-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
                <span className="text-lg font-bold text-white">S</span>
              </div>
              <h1 className="text-lg font-semibold text-white">ShopHub Admin</h1>
            </div>
          </div>
          
          
          {/* Desktop navigation - Scrollable */}
          <div className="flex-1 overflow-y-auto min-h-0">
            <nav className="space-y-1 px-4 py-6">
              {navigation.map((item) => {
                const isActive = isCurrentPath(item.href);
                const Icon = isActive ? item.iconSolid : item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 shadow-sm'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <div className="relative">
                      <Icon className={`mr-3 h-5 w-5 flex-shrink-0 ${
                        isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'
                      }`} />
                      {item.name === 'Notifications' && unreadCount > 0 && (
                        <span className="absolute -top-1 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-xs text-gray-500">{item.description}</div>
                    </div>
                  </Link>
                );
              })}
            </nav>
          </div>
          
          {/* Footer - Fixed at bottom */}
          <div className="bg-white dark:bg-gray-800 z-10 transition-colors duration-300">
            {/* Currency Selector */}
            <div className="border-t border-gray-200 dark:border-gray-700 p-4">
              <CurrencySelector />
            </div>

            {/* Back to Website */}
            <div className="border-t border-gray-200 p-4 pt-0">
              <Link
                to="/"
                className="flex w-full items-center justify-center rounded-lg bg-white border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
              >
                <GlobeAltIcon className="mr-2 h-5 w-5 text-gray-400" />
                Return to Website
              </Link>
            </div>

            {/* Desktop user info */}
            <div className="border-t border-gray-200 p-4 pt-0">
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                  <UserIcon className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user?.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                  title="Logout"
                >
                  <ArrowLeftOnRectangleIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Top header for mobile */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:hidden">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          
          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <h1 className="text-lg font-semibold text-gray-900">
                {navigation.find(item => isCurrentPath(item.href))?.name || 'Admin'}
              </h1>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
