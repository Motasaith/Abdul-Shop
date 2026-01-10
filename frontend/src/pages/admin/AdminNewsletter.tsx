import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import newsletterService from '../../services/newsletterService';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import {
  Mail,
  Users,
  Trash2,
  CheckCircle,
  XCircle,
  Search,
  Send,
  X,
  Filter,
  RefreshCw,
  TrendingUp,
  UserPlus,
  UserMinus,
  AlertTriangle
} from 'lucide-react';

interface NewsletterSubscriber {
  _id: string;
  email: string;
  isActive: boolean;
  subscriptionSource: string;
  subscribedAt: string;
  unsubscribedAt?: string;
  emailsSent: number;
}

interface NewsletterStats {
  overview: {
    total: number;
    active: number;
    inactive: number;
    recentSubscriptions: number;
  };
}

const AdminNewsletter: React.FC = () => {
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [stats, setStats] = useState<NewsletterStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  
  // Filters
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [limit] = useState(10);
  
  // Compose Email State
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailContent, setEmailContent] = useState('');
  const [targetFilter, setTargetFilter] = useState('active');
  const [sending, setSending] = useState(false);

  // Modals
  const [showDeleteModal, setShowDeleteModal] = useState<{isOpen: boolean, id: string, email: string}>({ isOpen: false, id: '', email: '' });
  const [showSendConfirmModal, setShowSendConfirmModal] = useState(false);

  useEffect(() => {
    fetchSubscribers();
    fetchStats();
  }, [currentPage, searchTerm, statusFilter, sourceFilter]);

  const fetchSubscribers = async () => {
    try {
      setLoading(true);
      const response = await newsletterService.getSubscribers(
        currentPage,
        limit,
        searchTerm,
        statusFilter,
        sourceFilter
      );
      setSubscribers(response.subscribers);
      setTotalPages(response.pagination.totalPages);
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch subscribers');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const response = await newsletterService.getStats();
      setStats(response);
    } catch (error: any) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  const handleDeleteSubscriber = async () => {
    try {
      await newsletterService.deleteSubscriber(showDeleteModal.id);
      toast.success('Subscriber deleted successfully');
      setShowDeleteModal({ isOpen: false, id: '', email: '' });
      fetchSubscribers();
      fetchStats();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete subscriber');
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await newsletterService.updateSubscriberStatus(id, !currentStatus);
      toast.success(`Subscriber ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      fetchSubscribers();
      fetchStats();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update subscriber status');
    }
  };

  const handleSendNewsletter = async () => {
    try {
      setSending(true);
      const response = await newsletterService.sendNewsletter({
        subject: emailSubject,
        content: emailContent,
        filter: targetFilter
      });
      
      toast.success(response.message || 'Newsletter sent successfully');
      setIsComposeOpen(false);
      setShowSendConfirmModal(false);
      setEmailSubject('');
      setEmailContent('');
      setTargetFilter('active');
      fetchStats();
    } catch (error: any) {
      toast.error(error.message || 'Failed to send newsletter');
    } finally {
      setSending(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
            Newsletter Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage subscribers and email campaigns
          </p>
        </div>
        <button
          onClick={() => setIsComposeOpen(true)}
          className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl shadow-lg shadow-blue-500/30 transition-all transform hover:-translate-y-0.5"
        >
          <Send className="w-5 h-5 mr-2" />
          Compose Newsletter
        </button>
      </div>

      {/* Stats Cards */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {/* Total Subscribers */}
        <motion.div variants={itemVariants} className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl p-6 rounded-2xl border border-white/20 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400">
              <Users className="w-6 h-6" />
            </div>
            <span className="text-xs font-medium px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg">
              Total
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {statsLoading ? '...' : stats?.overview.total || 0}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Subscribers</p>
        </motion.div>

        {/* Active Subscribers */}
        <motion.div variants={itemVariants} className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl p-6 rounded-2xl border border-white/20 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl text-green-600 dark:text-green-400">
              <CheckCircle className="w-6 h-6" />
            </div>
            <span className="text-xs font-medium px-2 py-1 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg">
              Active
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {statsLoading ? '...' : stats?.overview.active || 0}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Engaged Users</p>
        </motion.div>

        {/* Unsubscribed */}
        <motion.div variants={itemVariants} className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl p-6 rounded-2xl border border-white/20 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl text-red-600 dark:text-red-400">
              <UserMinus className="w-6 h-6" />
            </div>
            <span className="text-xs font-medium px-2 py-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
              Inactive
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {statsLoading ? '...' : stats?.overview.inactive || 0}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Unsubscribed</p>
        </motion.div>

        {/* Recent */}
        <motion.div variants={itemVariants} className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl p-6 rounded-2xl border border-white/20 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl text-purple-600 dark:text-purple-400">
              <TrendingUp className="w-6 h-6" />
            </div>
            <span className="text-xs font-medium px-2 py-1 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-lg">
              30 Days
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {statsLoading ? '...' : stats?.overview.recentSubscriptions || 0}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">New Growth</p>
        </motion.div>
      </motion.div>

      {/* Main Content Area */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700 shadow-xl overflow-hidden">
        {/* Filters Bar */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex flex-col lg:flex-row gap-4 justify-between items-center bg-white/50 dark:bg-gray-800/50">
          <div className="relative w-full lg:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search subscribers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-gray-900 dark:text-white placeholder-gray-400 shadow-sm"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-700 dark:text-gray-300 shadow-sm cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-700 dark:text-gray-300 shadow-sm cursor-pointer"
            >
              <option value="all">All Sources</option>
              <option value="homepage">Homepage</option>
              <option value="footer">Footer</option>
              <option value="checkout">Checkout</option>
            </select>

            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setSourceFilter('all');
                setCurrentPage(1);
              }}
              className="p-2.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
              title="Reset Filters"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : subscribers.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center text-gray-500 dark:text-gray-400">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-full mb-4">
                <Search className="w-8 h-8 text-blue-500" />
              </div>
              <p className="text-lg font-medium text-gray-900 dark:text-white">No subscribers found</p>
              <p className="text-sm mt-1">Try adjusting your search or filters</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50/50 dark:bg-gray-800/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Subscriber</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Source</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Interactions</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                <AnimatePresence>
                  {subscribers.map((sub) => (
                    <motion.tr
                      key={sub._id}
                      variants={itemVariants}
                      initial="hidden"
                      animate="show"
                      exit="hidden"
                      className="group hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-md">
                            {sub.email.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{sub.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          sub.isActive
                            ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800'
                            : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${sub.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                          {sub.isActive ? 'Active' : 'Unsubscribed'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">{sub.subscriptionSource}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(sub.subscribedAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Mail className="w-4 h-4 text-gray-400" />
                          {sub.emailsSent || 0} sent
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleToggleStatus(sub._id, sub.isActive)}
                            className={`p-2 rounded-lg transition-colors ${
                              sub.isActive 
                                ? 'text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20' 
                                : 'text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20'
                            }`}
                            title={sub.isActive ? 'Deactivate' : 'Activate'}
                          >
                            {sub.isActive ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => setShowDeleteModal({ isOpen: true, id: sub._id, email: sub.email })}
                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination - Simplified for brevity */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Page {currentPage} of {Math.max(1, totalPages)}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="px-4 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Compose Modal */}
      <AnimatePresence>
        {isComposeOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsComposeOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[50]"
            />
            <div className="fixed inset-0 z-[51] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-200 dark:border-gray-700"
              >
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Compose Newsletter</h3>
                  <button onClick={() => setIsComposeOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Target Audience</label>
                    <select
                      value={targetFilter}
                      onChange={(e) => setTargetFilter(e.target.value)}
                      className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white"
                    >
                      <option value="active">Active Subscribers (Recommended)</option>
                      <option value="all">All Subscribers</option>
                      <option value="inactive">Inactive Subscribers</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Subject</label>
                    <input
                      type="text"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white placeholder-gray-400"
                      placeholder="Enter email subject..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Content</label>
                    <textarea
                      value={emailContent}
                      onChange={(e) => setEmailContent(e.target.value)}
                      rows={8}
                      className="w-full p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white placeholder-gray-400 resize-none"
                      placeholder="Write your newsletter content here (HTML supported)..."
                    />
                  </div>
                </div>

                <div className="p-6 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3 bg-gray-50/50 dark:bg-gray-800/50">
                  <button
                    onClick={() => setIsComposeOpen(false)}
                    className="px-5 py-2.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setShowSendConfirmModal(true)}
                    disabled={!emailSubject || !emailContent}
                    className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30 transition-all"
                  >
                    Review & Send
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={showDeleteModal.isOpen}
        onClose={() => setShowDeleteModal({ isOpen: false, id: '', email: '' })}
        onConfirm={handleDeleteSubscriber}
        title="Delete Subscriber"
        message={`Are you sure you want to permanently delete ${showDeleteModal.email} from your list?`}
        confirmText="Delete Subscriber"
        variant="danger"
        icon={Trash2}
      />

      {/* Send Confirmation */}
      <ConfirmationModal
        isOpen={showSendConfirmModal}
        onClose={() => setShowSendConfirmModal(false)}
        onConfirm={handleSendNewsletter}
        title="Send Newsletter?"
        message={`You are about to send this newsletter to ${targetFilter === 'active' ? 'all active' : targetFilter} subscribers. This action cannot be undone.`}
        confirmText={sending ? "Sending..." : "Send Now"}
        variant="info"
        icon={Send}
      />
    </div>
  );
};

export default AdminNewsletter;
