import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import contactService, { ContactSubmission } from '../../services/contactService';
import { toast } from 'react-hot-toast';
import {
  Search,
  Filter,
  RefreshCw,
  MessageSquare,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  Inbox,
  User,
  Mail
} from 'lucide-react';

const AdminSupportPage: React.FC = () => {
  const [tickets, setTickets] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState({
    status: '',
    priority: '',
    subject: ''
  });

  useEffect(() => {
    fetchTickets();
  }, [page, filter]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const queryFilter: any = {};
      if (filter.status) queryFilter.status = filter.status;
      if (filter.priority) queryFilter.priority = filter.priority;
      if (filter.subject) queryFilter.subject = filter.subject;

      const { data } = await contactService.getContacts(page, 10, queryFilter);
      setTickets(data.contacts);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilter({ ...filter, [e.target.name]: e.target.value });
    setPage(1);
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending': return { color: 'text-yellow-500', bg: 'bg-yellow-100 dark:bg-yellow-900/30', icon: Clock, label: 'Pending' };
      case 'in-progress': return { color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30', icon: MessageSquare, label: 'In Progress' };
      case 'resolved': return { color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/30', icon: CheckCircle, label: 'Resolved' };
      case 'closed': return { color: 'text-gray-500', bg: 'bg-gray-100 dark:bg-gray-800', icon: XCircle, label: 'Closed' };
      default: return { color: 'text-gray-500', bg: 'bg-gray-100 dark:bg-gray-800', icon: AlertCircle, label: status };
    }
  };

  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case 'urgent': return { color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/30', label: 'Urgent' };
      case 'high': return { color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-900/30', label: 'High' };
      case 'medium': return { color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30', label: 'Medium' };
      case 'low': return { color: 'text-gray-500', bg: 'bg-gray-100 dark:bg-gray-800', label: 'Low' };
      default: return { color: 'text-gray-500', bg: 'bg-gray-100 dark:bg-gray-800', label: priority };
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
            Support Tickets
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage customer inquiries and support requests
          </p>
        </div>
        
        <div className="flex gap-2">
           <button
             onClick={() => {
               setFilter({ status: '', priority: '', subject: '' });
               setPage(1);
             }}
             className="px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center gap-2"
           >
             <RefreshCw className="w-4 h-4" />
             Reset Filters
           </button>
        </div>
      </div>

      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700 shadow-xl overflow-hidden">
        {/* Filters Bar */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row gap-4 bg-white/50 dark:bg-gray-800/50">
           <div className="relative flex-1 min-w-[200px]">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              name="status"
              value={filter.status}
              onChange={handleFilterChange}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-700 dark:text-gray-300 appearance-none cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          <div className="relative flex-1 min-w-[200px]">
            <AlertCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              name="priority"
              value={filter.priority}
              onChange={handleFilterChange}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-700 dark:text-gray-300 appearance-none cursor-pointer"
            >
              <option value="">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div className="relative flex-1 min-w-[200px]">
            <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              name="subject"
              value={filter.subject}
              onChange={handleFilterChange}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-700 dark:text-gray-300 appearance-none cursor-pointer"
            >
              <option value="">All Subjects</option>
              <option value="general">General</option>
              <option value="support">Support</option>
              <option value="order">Order Issues</option>
              <option value="return">Returns</option>
              <option value="feedback">Feedback</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : tickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center text-gray-500 dark:text-gray-400">
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-full mb-4">
              <Inbox className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-lg font-medium text-gray-900 dark:text-white">No tickets found</p>
            <p className="text-sm mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                <tr>
                  <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ticket ID</th>
                  <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                  <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Subject</th>
                  <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Priority</th>
                  <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Created</th>
                  <th className="px-4 md:px-6 py-3 md:py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                <AnimatePresence>
                  {tickets.map((ticket) => {
                    const statusConfig = getStatusConfig(ticket.status);
                    const priorityConfig = getPriorityConfig(ticket.priority);
                    
                    return (
                      <motion.tr
                        key={ticket._id}
                        variants={itemVariants}
                        initial="hidden"
                        animate="show"
                        exit="hidden"
                        className="group hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors"
                      >
                        <td className="px-4 md:px-6 py-3 md:py-4">
                          <span className="font-mono text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-md">
                            #{ticket._id.slice(-6).toUpperCase()}
                          </span>
                        </td>
                        <td className="px-4 md:px-6 py-3 md:py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400 flex-shrink-0">
                              <User className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm font-medium text-gray-900 dark:text-white truncate">{ticket.name}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 truncate">
                                <Mail className="w-3 h-3 flex-shrink-0" />
                                {ticket.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 md:px-6 py-3 md:py-4">
                          <span className="text-sm text-gray-700 dark:text-gray-300 font-medium line-clamp-1">
                            {ticket.subject}
                          </span>
                        </td>
                        <td className="px-4 md:px-6 py-3 md:py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${priorityConfig.bg} ${priorityConfig.color} border-current border-opacity-20 whitespace-nowrap`}>
                            {priorityConfig.label}
                          </span>
                        </td>
                        <td className="px-4 md:px-6 py-3 md:py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusConfig.bg} ${statusConfig.color} border-current border-opacity-20 whitespace-nowrap`}>
                            <statusConfig.icon className="w-3 h-3" />
                            {statusConfig.label}
                          </span>
                        </td>
                        <td className="px-4 md:px-6 py-3 md:py-4">
                          <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                            {new Date(ticket.createdAt).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="px-4 md:px-6 py-3 md:py-4 text-right">
                          <Link 
                            to={`/admin/support/${ticket._id}`}
                            className="inline-flex items-center px-3 py-1.5 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 text-xs font-medium rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors opacity-100 sm:opacity-0 sm:group-hover:opacity-100 shadow-sm whitespace-nowrap"
                          >
                            Manage
                            <ArrowRight className="w-3 h-3 ml-1.5" />
                          </Link>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
               >
                Previous
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSupportPage;
