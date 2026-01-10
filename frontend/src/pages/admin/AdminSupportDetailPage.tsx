import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import contactService, { ContactSubmission } from '../../services/contactService';
import { toast } from 'react-hot-toast';
import {
  ArrowLeft,
  Clock,
  User,
  Mail,
  Phone,
  Send,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  Shield,
  Calendar,
  ChevronDown
} from 'lucide-react';

const AdminSupportDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<ContactSubmission | null>(null);
  const [loading, setLoading] = useState(true);
  const [replyMessage, setReplyMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);

  useEffect(() => {
    if (id) {
      fetchTicket(id);
    }
  }, [id]);

  const fetchTicket = async (ticketId: string) => {
    try {
      setLoading(true);
      const { data } = await contactService.getContact(ticketId);
      setTicket(data);
    } catch (error) {
      console.error('Error fetching ticket:', error);
      toast.error('Failed to load ticket');
      navigate('/admin/support');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!ticket) return;
    try {
      setStatusUpdating(true);
      await contactService.updateContactStatus(ticket._id, newStatus);
      toast.success(`Status updated to ${newStatus}`);
      fetchTicket(ticket._id);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticket || !replyMessage.trim()) return;

    try {
      setSubmitting(true);
      await contactService.respondToContact(ticket._id, replyMessage);
      toast.success('Reply sent successfully');
      setReplyMessage('');
      fetchTicket(ticket._id);
    } catch (error) {
      console.error('Error sending reply:', error);
      toast.error('Failed to send reply');
    } finally {
      setSubmitting(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-900/50';
      case 'high': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-900/50';
      case 'medium': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-900/50';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!ticket) return null;

  return (
    <div className="space-y-6">
      <Link 
        to="/admin/support" 
        className="inline-flex items-center text-sm text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Tickets
      </Link>

      {/* Header Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700 shadow-xl p-6"
      >
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {ticket.subject === 'order' ? `Order #${ticket.orderNumber}` : ticket.subject}
              </h1>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getPriorityColor(ticket.priority)}`}>
                {ticket.priority.toUpperCase()}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <Shield className="w-4 h-4" />
                Ticket #{ticket._id.slice(-6).toUpperCase()}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(ticket.createdAt).toLocaleString()}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800/50 p-1.5 rounded-xl border border-gray-100 dark:border-gray-700">
            <div className="relative">
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <select
                value={ticket.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={statusUpdating}
                className="pl-4 pr-10 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium appearance-none cursor-pointer disabled:opacity-50 min-w-[140px]"
              >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chat Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* User Query */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700 shadow-xl overflow-hidden"
          >
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <User className="w-4 h-4 text-blue-500" />
                User Query
              </h3>
            </div>
            <div className="p-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center text-gray-500 font-semibold shadow-inner">
                  {ticket.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-baseline justify-between">
                    <h4 className="font-medium text-gray-900 dark:text-white">{ticket.name}</h4>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(ticket.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="prose prose-sm dark:prose-invert max-w-none p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl rounded-tl-none border border-gray-100 dark:border-gray-700/50">
                    <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 m-0">{ticket.message}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Admin Response or Reply Form */}
          <AnimatePresence mode="wait">
            {ticket.response ? (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-blue-100 dark:border-blue-900/30 shadow-xl overflow-hidden"
              >
                <div className="p-4 border-b border-blue-50 dark:border-blue-900/30 bg-blue-50/30 dark:bg-blue-900/10 flex items-center justify-between">
                  <h3 className="font-semibold text-blue-900 dark:text-blue-300 flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Admin Response
                  </h3>
                  <span className="text-xs text-blue-700 dark:text-blue-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(ticket.response.respondedAt).toLocaleString()}
                  </span>
                </div>
                <div className="p-6">
                  <div className="prose prose-sm max-w-none p-4 bg-blue-50/10 rounded-2xl border border-blue-50 dark:border-blue-900/20">
                    <p className="whitespace-pre-wrap text-gray-800 dark:text-gray-200 m-0">{ticket.response.message}</p>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1 rounded-full">
                      <CheckCircle className="w-3 h-3" />
                      Response Sent
                    </span>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700 shadow-xl overflow-hidden"
              >
                <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
                  <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-blue-500" />
                    Write a Reply
                  </h3>
                </div>
                <form onSubmit={handleReply} className="p-6">
                  <textarea
                    rows={6}
                    className="w-full p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                    placeholder="Type your professional response here..."
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    required
                  />
                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      This response will be emailed to the user.
                    </p>
                    <button
                      type="submit"
                      disabled={submitting || !replyMessage.trim()}
                      className="inline-flex items-center px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-medium shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
                    >
                      {submitting ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Send Response
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700 shadow-xl p-6"
          >
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
              Contact Details
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Name</p>
                  <p className="font-medium text-gray-900 dark:text-white">{ticket.name}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-purple-600 dark:text-purple-400">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                  <a href={`mailto:${ticket.email}`} className="font-medium text-blue-600 hover:underline">
                    {ticket.email}
                  </a>
                </div>
              </div>

              {ticket.phone && (
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg text-emerald-600 dark:text-emerald-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Phone</p>
                    <p className="font-medium text-gray-900 dark:text-white">{ticket.phone}</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AdminSupportDetailPage;
