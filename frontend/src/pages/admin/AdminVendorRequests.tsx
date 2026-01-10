import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { User } from '../../types';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import { 
  Users, 
  Store, 
  Mail, 
  Phone, 
  Calendar, 
  Check, 
  X, 
  Search,
  Filter,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

const AdminVendorRequests: React.FC = () => {
  const [requests, setRequests] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  
  // Search state
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: 'approve' | 'reject';
    id: string;
    name: string;
  }>({ isOpen: false, type: 'approve', id: '', name: '' });

  const fetchRequests = async () => {
    try {
      const { data } = await api.get('/admin/vendors/requests');
      setRequests(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching vendor requests:', error);
      toast.error('Failed to load vendor requests');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const openApproveModal = (id: string, name: string) => {
    setConfirmModal({ isOpen: true, type: 'approve', id, name });
  };

  const openRejectModal = (id: string, name: string) => {
    setConfirmModal({ isOpen: true, type: 'reject', id, name });
  };

  const handleConfirmAction = async () => {
    const { id, name, type } = confirmModal;
    setProcessingId(id);
    setConfirmModal(prev => ({ ...prev, isOpen: false }));

    try {
      if (type === 'approve') {
        await api.put(`/admin/vendors/${id}/approve`);
        toast.success(`${name} approved successfully`);
      } else {
        await api.put(`/admin/vendors/${id}/reject`);
        toast.success(`${name}'s application rejected`);
      }
      fetchRequests();
    } catch (error) {
      console.error(`Error ${type}ing vendor:`, error);
      toast.error(`Failed to ${type} vendor`);
    } finally {
      setProcessingId(null);
    }
  };

  const filteredRequests = requests.filter(req => 
    req.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.vendorDetails?.shopName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
            Vendor Applications
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Review and manage incoming vendor registration requests
          </p>
        </div>

        {/* Stats Card */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl p-4 rounded-2xl border border-white/20 dark:border-gray-700 shadow-sm flex items-center gap-4 min-w-[200px]">
            <div className="p-3 bg-blue-500/10 rounded-xl">
              <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Pending Requests</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{requests.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700 shadow-xl overflow-hidden">
        {/* Toolbar */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row gap-4 justify-between items-center bg-white/50 dark:bg-gray-800/50">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search request..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-gray-900 dark:text-white placeholder-gray-400"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {filteredRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center text-gray-500 dark:text-gray-400">
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-full mb-4">
                <Search className="w-8 h-8 opacity-50" />
              </div>
              <p className="text-lg font-medium">No pending requests found</p>
              <p className="text-sm mt-1">{searchTerm ? `No results for "${searchTerm}"` : 'All caught up! No new applications.'}</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50/50 dark:bg-gray-800/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Applicant</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Shop Details</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date Applied</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                <AnimatePresence>
                  {filteredRequests.map((request) => (
                    <motion.tr
                      key={request._id}
                      variants={itemVariants}
                      initial="hidden"
                      animate="show"
                      exit="hidden"
                      className="group hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20">
                            {request.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 dark:text-white text-sm">{request.name}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">ID: {request._id.slice(-6)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Store className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {request.vendorDetails?.shopName || 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                            <Mail className="w-3.5 h-3.5" />
                            {request.email}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                            <Phone className="w-3.5 h-3.5" />
                            {request.phone || 'No phone'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                          <Calendar className="w-4 h-4" />
                          {new Date(request.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openApproveModal(request._id, request.name)}
                            disabled={processingId === request._id}
                            className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/40 transition-colors disabled:opacity-50"
                            title="Approve"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openRejectModal(request._id, request.name)}
                            disabled={processingId === request._id}
                            className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 transition-colors disabled:opacity-50"
                            title="Reject"
                          >
                            <X className="w-4 h-4" />
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
      </div>

      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={handleConfirmAction}
        title={confirmModal.type === 'approve' ? "Approve Vendor Application" : "Reject Vendor Application"}
        message={
          confirmModal.type === 'approve' 
            ? `Are you sure you want to approve ${confirmModal.name}? They will be granted access to the vendor dashboard immediately.`
            : `Are you sure you want to reject ${confirmModal.name}'s application? This action cannot be undone.`
        }
        confirmText={confirmModal.type === 'approve' ? 'Approve Vendor' : 'Reject Application'}
        cancelText="Cancel"
        variant={confirmModal.type === 'approve' ? undefined : 'danger'}
        icon={confirmModal.type === 'approve' ? CheckCircle : XCircle}
      />
    </div>
  );
};

export default AdminVendorRequests;
