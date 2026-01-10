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

  ];

  const isCurrentPath = (path: string) => {
    return location.pathname === path || (path === '/admin' && location.pathname === '/admin');
  };

  // Custom Scrollbar Styles
  const scrollbarStyles = `
    .custom-scrollbar::-webkit-scrollbar {
      width: 5px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: transparent;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: rgba(100, 116, 139, 0.5);
      border-radius: 10px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: rgba(100, 116, 139, 0.8);
    }
  `;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 font-sans">
      <style>{scrollbarStyles}</style>
      
      {/* Mobile menu backdrop */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm" onClick={() => setSidebarOpen(false)}></div>
        
        {/* Mobile sidebar */}
        <div className="fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-gray-800 shadow-2xl transition-all duration-300">
           {/* Mobile Sidebar Content (Same as desktop but with close button) */}
           <div className="flex h-full flex-col">
             <div className="flex h-20 items-center justify-between px-6 border-b border-gray-100 dark:border-gray-700/50">
                <div className="flex items-center space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/30">
                    <span className="text-xl font-bold text-white">S</span>
                  </div>
                  <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
                    ShopHub
                  </h1>
                </div>
                <button onClick={() => setSidebarOpen(false)} className="text-gray-500">
                  <XMarkIcon className="h-6 w-6" />
                </button>
             </div>
             {/* Navigation reused below logic... simplified for update */}
             {/* We will reuse the same mapping structure for mobile */}
              <nav className="flex-1 space-y-2 px-4 py-6 overflow-y-auto custom-scrollbar">
                {navigation.map((item) => {
                  const isActive = isCurrentPath(item.href);
                  const Icon = isActive ? item.iconSolid : item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`group relative flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      <Icon className={`mr-3 h-5 w-5 flex-shrink-0 transition-colors ${
                        isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300'
                      }`} />
                      <div className="flex-1">
                        <span className="block font-semibold">{item.name}</span>
                        <span className={`text-[10px] ${isActive ? 'text-blue-100' : 'text-gray-400'} group-hover:opacity-100`}>{item.description}</span>
                      </div>
                      {item.name === 'Notifications' && unreadCount > 0 && (
                        <span className="absolute right-3 top-3 flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
           </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
        <div className="flex h-full flex-col bg-white dark:bg-[#0B1120] border-r border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden transition-colors duration-300">
          
          {/* Header */}
          <div className="flex h-20 items-center px-6 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/30">
                <span className="text-xl font-bold text-white">S</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-none">ShopHub</h1>
                <span className="text-xs text-blue-500 font-semibold tracking-wider">ADMIN</span>
              </div>
            </div>
          </div>
          
          {/* Navigation */}
          <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar py-6 px-4">
            <nav className="space-y-2">
              {navigation.map((item) => {
                const isActive = isCurrentPath(item.href);
                const Icon = isActive ? item.iconSolid : item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group relative flex items-center px-4 py-3.5 text-sm font-medium rounded-2xl transition-all duration-300 ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/40 translate-x-1'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/80 hover:text-gray-900 dark:hover:text-white hover:translate-x-1'
                    }`}
                  >
                    <Icon className={`mr-3.5 h-6 w-6 flex-shrink-0 transition-colors ${
                      isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'
                    }`} />
                    <div className="flex-1">
                      <span className="block font-bold tracking-wide">{item.name}</span>
                      <span className={`text-[10px] uppercase tracking-wider font-semibold ${isActive ? 'text-blue-100' : 'text-gray-400 group-hover:text-gray-500'}`}>{item.description}</span>
                    </div>
                    
                    {/* Active Indicator */}
                    {isActive && (
                       <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-white/30 rounded-r-full" />
                    )}

                    {item.name === 'Notifications' && unreadCount > 0 && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-gray-900">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
          
          {/* Footer - Profile & Settings */}
          <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 backdrop-blur-sm">
             {/* Currency Selector */}
             <div className="mb-4">
               <CurrencySelector />
             </div>

             {/* Return to Website Button */}
             <Link
                to="/"
                className="flex w-full items-center justify-center rounded-xl bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 px-4 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-200 shadow-sm hover:shadow-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-all mb-4"
              >
                <GlobeAltIcon className="mr-2 h-5 w-5 text-gray-500" />
                Visit Website
              </Link>
              
            <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-white dark:hover:bg-gray-700 transition-colors cursor-pointer group">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 p-0.5">
                 <div className="h-full w-full rounded-full bg-white dark:bg-gray-800 flex items-center justify-center overflow-hidden">
                    {/* Simple user avatar or icon */}
                    <UserIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                 </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">Admin</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                title="Logout"
              >
                <ArrowLeftOnRectangleIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-72 transition-all duration-300 bg-gray-50 dark:bg-gray-900 min-h-screen">
        {/* Top header for mobile */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md px-4 shadow-sm lg:hidden">
          <div className="flex items-center gap-3">
             <button
              type="button"
              className="-m-2.5 p-2.5 text-gray-700 dark:text-gray-200"
              onClick={() => setSidebarOpen(true)}
             >
              <Bars3Icon className="h-6 w-6" />
             </button>
             <h1 className="text-lg font-bold text-gray-900 dark:text-white">ShopHub</h1>
          </div>
          <div className="flex items-center">
             <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs">
               A
             </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
