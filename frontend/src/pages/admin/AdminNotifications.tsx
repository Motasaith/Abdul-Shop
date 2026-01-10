import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import notificationService from '../../services/notificationService';
import { 
  CheckCircle, 
  AlertTriangle, 
  ShoppingBag, 
  UserPlus, 
  Mail,
  Trash2,
  Check,
  Bell,
  Clock,
  Info
} from 'lucide-react';
import ConfirmationModal from '../../components/common/ConfirmationModal';

interface Notification {
  _id: string;
  type: 'order' | 'user' | 'stock' | 'system' | 'newsletter';
  message: string;
  read: boolean;
  createdAt: string;
  data?: any;
}

const AdminNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showClearModal, setShowClearModal] = useState(false);

  const fetchNotifications = async (pageNum = 1) => {
    try {
      setLoading(true);
      const data = await notificationService.getNotifications(pageNum);
      setNotifications(data.notifications);
      setTotalPages(data.pagination.totalPages);
      setUnreadCount(data.unreadCount);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load notifications');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications(page);
  }, [page]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(notifications.map(n => 
        n._id === id ? { ...n, read: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
      toast.success('Marked as read');
    } catch (error) {
      toast.error('Failed to mark as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all as read');
    }
  };

  const handleClearAll = async () => {
    try {
      await notificationService.clearAllNotifications();
      setNotifications([]);
      setUnreadCount(0);
      setTotalPages(1);
      setShowClearModal(false);
      toast.success('All notifications cleared');
    } catch (error) {
      toast.error('Failed to clear notifications');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications(notifications.filter(n => n._id !== id));
      toast.success('Notification deleted');
    } catch (error) {
      toast.error('Failed to delete notification');
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <ShoppingBag className="h-5 w-5 text-blue-500" />;
      case 'user':
        return <UserPlus className="h-5 w-5 text-green-500" />;
      case 'stock':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'newsletter':
        return <Mail className="h-5 w-5 text-purple-500" />;
      default:
        return <Info className="h-5 w-5 text-gray-500" />;
    }
  };

  const getIconBg = (type: string) => {
    switch (type) {
      case 'order':
        return 'bg-blue-100 dark:bg-blue-900/30';
      case 'user':
        return 'bg-green-100 dark:bg-green-900/30';
      case 'stock':
        return 'bg-amber-100 dark:bg-amber-900/30';
      case 'newsletter':
        return 'bg-purple-100 dark:bg-purple-900/30';
      default:
        return 'bg-gray-100 dark:bg-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    // If less than 24 hours, show relative time
    if (diff < 24 * 60 * 60 * 1000) {
      if (diff < 60 * 60 * 1000) {
        const minutes = Math.floor(diff / (60 * 1000));
        return `${minutes}m ago`;
      }
      const hours = Math.floor(diff / (60 * 60 * 1000));
      return `${hours}h ago`;
    }
    
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  if (loading && notifications.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
            Notifications
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-2">
            You have <span className="font-semibold text-blue-600 dark:text-blue-400">{unreadCount}</span> unread notifications
          </p>
        </div>
        
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all active:scale-95"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Mark all read
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={() => setShowClearModal(true)}
              className="flex items-center px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl border border-red-100 dark:border-red-900/30 shadow-sm hover:bg-red-100 dark:hover:bg-red-900/40 transition-all active:scale-95"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl rounded-2xl p-12 text-center border border-white/20 dark:border-gray-700 shadow-sm">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">All caught up!</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              You have no new notifications at the moment.
            </p>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-3"
          >
            <AnimatePresence>
              {notifications.map((notification) => (
                <motion.div
                  key={notification._id}
                  variants={itemVariants}
                  exit={{ opacity: 0, x: -20 }}
                  className={`group relative overflow-hidden rounded-2xl p-4 transition-all duration-200 border ${
                    !notification.read
                      ? 'bg-white dark:bg-gray-800 border-blue-200 dark:border-blue-900/50 shadow-md ring-1 ring-blue-500/20'
                      : 'bg-white/60 dark:bg-gray-900/60 border-gray-100 dark:border-gray-800 hover:bg-white dark:hover:bg-gray-800'
                  }`}
                >
                  <div className="flex gap-4">
                    {/* Icon */}
                    <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${getIconBg(notification.type)}`}>
                      {getIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 pt-1">
                      <div className="flex justify-between items-start gap-4">
                        <p className={`text-base ${!notification.read ? 'font-semibold text-gray-900 dark:text-white' : 'font-medium text-gray-700 dark:text-gray-300'}`}>
                          {notification.message}
                        </p>
                        <span className="flex items-center text-xs text-gray-400 whitespace-nowrap">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatDate(notification.createdAt)}
                        </span>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!notification.read && (
                          <button
                            onClick={() => handleMarkAsRead(notification._id)}
                            className="flex items-center text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                          >
                            <Check className="w-3 h-3 mr-1" />
                            Mark read
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(notification._id)}
                          className="flex items-center text-xs font-medium text-red-500 hover:text-red-700 transition-colors ml-auto"
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Unread Indicator Dot */}
                  {!notification.read && (
                    <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-blue-500" />
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 pt-6">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 flex items-center">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
          >
            Next
          </button>
        </div>
      )}

      <ConfirmationModal
        isOpen={showClearModal}
        onClose={() => setShowClearModal(false)}
        onConfirm={handleClearAll}
        title="Clear All Notifications"
        message="Are you sure you want to delete all notifications? This action cannot be undone."
        confirmText="Clear All"
        variant="danger"
        icon={Trash2}
      />
    </div>
  );
};

export default AdminNotifications;
