import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import adminService from '../../services/adminService';
import { toast } from 'react-hot-toast';
import { User, Shop } from '../../types';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import { 
  Users, Store, Check, X, Search, 
  Percent, Eye, DollarSign
} from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminVendorsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'requests' | 'active' | 'payouts'>('active');
  const [loading, setLoading] = useState(true);
  const [vendors, setVendors] = useState<User[]>([]);
  const [requests, setRequests] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: 'approve' | 'reject' | 'ban' | 'activate';
    id: string;
    name: string;
  }>({ isOpen: false, type: 'approve', id: '', name: '' });

  const [commissionModal, setCommissionModal] = useState<{
    isOpen: boolean;
    id: string;
    name: string;
    currentRate: number;
  }>({ isOpen: false, id: '', name: '', currentRate: 0 });
  
  const [newCommissionRate, setNewCommissionRate] = useState<number>(0);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Parallel fetch for efficiency
      const [requestsRes, vendorsRes] = await Promise.all([
        api.get('/admin/vendors/requests'),
        adminService.getUsers({ role: 'vendor' })
      ]);
      
      setRequests(requestsRes.data);
      setVendors(vendorsRes.users || []); // adminService returns { users: [], ... }
    } catch (error) {
      console.error('Error fetching vendor data:', error);
      toast.error('Failed to load vendor data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* --- Actions --- */

  const handleApproveReject = async (id: string, type: 'approve' | 'reject') => {
    try {
      if (type === 'approve') {
        await api.put(`/admin/vendors/${id}/approve`);
        toast.success('Vendor approved successfully');
      } else {
        await api.put(`/admin/vendors/${id}/reject`);
        toast.success('Vendor application rejected');
      }
      fetchData(); // Refresh all lists
    } catch (error) {
      toast.error(`Failed to ${type} vendor`);
      console.error(error);
    }
    setConfirmModal(prev => ({ ...prev, isOpen: false }));
  };

  const handleBanActivate = async (id: string, type: 'ban' | 'activate') => {
    try {
      const status = type === 'ban' ? 'banned' : 'approved';
      // We use the new endpoint
      await api.updateVendorStatus(id, status);
      toast.success(`Vendor ${type === 'ban' ? 'banned' : 'activated'} successfully`);
      fetchData();
    } catch (error) {
      toast.error(`Failed to ${type} vendor`);
      console.error(error);
    }
    setConfirmModal(prev => ({ ...prev, isOpen: false }));
  };

  const handleUpdateCommission = async () => {
    try {
      if (newCommissionRate < 0 || newCommissionRate > 100) {
        toast.error('Commission rate must be between 0 and 100');
        return;
      }
      
      await api.updateVendorCommission(commissionModal.id, newCommissionRate);
      toast.success('Commission rate updated');
      setCommissionModal(prev => ({ ...prev, isOpen: false }));
      fetchData();
    } catch (error) {
      toast.error('Failed to update commission');
      console.error(error);
    }
  };

  /* --- Render Helpers --- */

  const filteredRequests = requests.filter(req => 
    req.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.vendorDetails?.shopName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredVendors = vendors.filter(v => 
    v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.vendorDetails?.shopName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && vendors.length === 0 && requests.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
          Vendor Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Monitor vendor performance, approve requests, and manage payouts.
        </p>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl p-2 rounded-2xl border border-white/20 dark:border-gray-700/30">
        <div className="flex gap-2 p-1 bg-gray-100/50 dark:bg-gray-900/50 rounded-xl overflow-x-auto w-full md:w-auto custom-scrollbar">
          {[
            { id: 'active', label: 'Active Vendors', icon: Store },
            { id: 'requests', label: 'Requests', icon: Users, count: requests.length },
            { id: 'payouts', label: 'Payout Settings', icon: DollarSign }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              <tab.icon className="w-4 h-4 flex-shrink-0" />
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-red-500 text-white rounded-full">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64 flex-shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search vendors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>

      {/* Content Area */}
      <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl border border-white/20 dark:border-gray-700/30 rounded-2xl shadow-xl overflow-hidden min-h-[400px]">
        
        {/* REQUESTS TAB */}
        {activeTab === 'requests' && (
          <div className="overflow-x-auto">
             {filteredRequests.length === 0 ? (
                <div className="p-12 text-center text-gray-500">No pending vendor applications.</div>
             ) : (
              <table className="w-full min-w-[600px]">
                <thead className="bg-gray-50/50 dark:bg-gray-900/30">
                  <tr>
                    <th className="px-4 md:px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">Applicant</th>
                    <th className="px-4 md:px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">Shop Name</th>
                    <th className="px-4 md:px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">Date Applied</th>
                    <th className="px-4 md:px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {filteredRequests.map((req) => (
                    <tr key={req._id} className="hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors">
                      <td className="px-4 md:px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold flex-shrink-0">
                            {req.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{req.name}</p>
                            <p className="text-xs text-gray-500 truncate">{req.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                        {req.vendorDetails?.shopName}
                      </td>
                      <td className="px-4 md:px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                        {new Date(req.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 md:px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => setConfirmModal({ isOpen: true, type: 'approve', id: req._id, name: req.name })}
                            className="p-1.5 bg-green-100 text-green-600 rounded-lg hover:bg-green-200"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button 
                             onClick={() => setConfirmModal({ isOpen: true, type: 'reject', id: req._id, name: req.name })}
                             className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
             )}
          </div>
        )}

        {/* ACTIVE VENDORS TAB */}
        {activeTab === 'active' && (
          <div className="overflow-x-auto">
             {filteredVendors.length === 0 ? (
                <div className="p-12 text-center text-gray-500">No active vendors found.</div>
             ) : (
              <table className="w-full min-w-[600px]">
                <thead className="bg-gray-50/50 dark:bg-gray-900/30">
                  <tr>
                    <th className="px-4 md:px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">Vendor</th>
                    <th className="px-4 md:px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">Shop</th>
                    <th className="px-4 md:px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">Status</th>
                    <th className="px-4 md:px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">Commission</th>
                    <th className="px-4 md:px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {filteredVendors.map((vendor) => (
                    <tr key={vendor._id} className="hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors">
                      <td className="px-4 md:px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold flex-shrink-0">
                            {vendor.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{vendor.name}</p>
                            <p className="text-xs text-gray-500 truncate">{vendor.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4">
                        <Link to={`/shop/${vendor._id}`} className="flex items-center gap-2 group">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-500 transition-colors truncate max-w-[120px]">
                             {vendor.vendorDetails?.shopName}
                          </span>
                          <Eye className="w-3 h-3 text-gray-400 group-hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                        </Link>
                      </td>
                      <td className="px-4 md:px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap ${
                          vendor.vendorStatus === 'banned'
                            ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400'
                            : 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400'
                        }`}>
                          {vendor.vendorStatus === 'banned' ? 'Banned' : 'Active'}
                        </span>
                      </td>
                      <td className="px-4 md:px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {vendor.vendorDetails?.commissionRate || 0}%
                      </td>
                      <td className="px-4 md:px-6 py-4 text-right">
                        {vendor.vendorStatus === 'banned' ? (
                          <button
                            onClick={() => setConfirmModal({ isOpen: true, type: 'activate', id: vendor._id, name: vendor.name })}
                            className="text-green-600 hover:text-green-800 text-xs font-medium px-3 py-1 bg-green-50 rounded-lg hover:bg-green-100 transition-colors whitespace-nowrap"
                          >
                            Unban
                          </button>
                        ) : (
                          <button
                            onClick={() => setConfirmModal({ isOpen: true, type: 'ban', id: vendor._id, name: vendor.name })}
                            className="text-red-600 hover:text-red-800 text-xs font-medium px-3 py-1 bg-red-50 rounded-lg hover:bg-red-100 transition-colors whitespace-nowrap"
                          >
                            Ban Access
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
             )}
          </div>
        )}

        {/* PAYOUT SETTINGS TAB */}
        {activeTab === 'payouts' && (
          <div className="overflow-x-auto">
             {filteredVendors.length === 0 ? (
                <div className="p-12 text-center text-gray-500">No active vendors found.</div>
             ) : (
              <table className="w-full min-w-[600px]">
                <thead className="bg-gray-50/50 dark:bg-gray-900/30">
                  <tr>
                    <th className="px-4 md:px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">Vendor Shop</th>
                    <th className="px-4 md:px-6 py-4 text-center text-xs font-semibold text-gray-500 dark:text-gray-400">Current Tax %</th>
                    <th className="px-4 md:px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">Earnings Split</th>
                    <th className="px-4 md:px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {filteredVendors.map((vendor) => {
                    const rate = vendor.vendorDetails?.commissionRate || 0;
                    return (
                      <tr key={vendor._id} className="hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors">
                        <td className="px-4 md:px-6 py-4">
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{vendor.vendorDetails?.shopName}</p>
                            <p className="text-xs text-gray-500 truncate">{vendor.name}</p>
                          </div>
                        </td>
                        <td className="px-4 md:px-6 py-4 text-center">
                          <span className="inline-flex items-center px-3 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold text-sm">
                            {rate}%
                          </span>
                        </td>
                        <td className="px-4 md:px-6 py-4">
                          <div className="w-full max-w-xs bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 flex overflow-hidden">
                            <div className="bg-green-500 h-2.5" style={{ width: `${100 - rate}%` }} title={`Vendor Gets ${100 - rate}%`}></div>
                            <div className="bg-indigo-500 h-2.5" style={{ width: `${rate}%` }} title={`Admin Tax ${rate}%`}></div>
                          </div>
                          <div className="flex justify-between text-[10px] mt-1 text-gray-500 min-w-[120px]">
                            <span>Vendor: {100 - rate}%</span>
                            <span>Admin: {rate}%</span>
                          </div>
                        </td>
                        <td className="px-4 md:px-6 py-4 text-right">
                          <button
                            onClick={() => {
                              setNewCommissionRate(rate);
                              setCommissionModal({ isOpen: true, id: vendor._id, name: vendor.vendorDetails?.shopName || vendor.name, currentRate: rate });
                            }}
                            className="flex items-center gap-1 ml-auto text-blue-600 hover:text-blue-800 text-xs font-medium px-3 py-1.5 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors whitespace-nowrap"
                          >
                            <Percent className="w-3 h-3" />
                            Edit Rate
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
             )}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={() => {
          if (confirmModal.type === 'approve' || confirmModal.type === 'reject') {
            handleApproveReject(confirmModal.id, confirmModal.type);
          } else {
            handleBanActivate(confirmModal.id, confirmModal.type as 'ban' | 'activate');
          }
        }}
        title={`${confirmModal.type.charAt(0).toUpperCase() + confirmModal.type.slice(1)} Vendor`}
        message={`Are you sure you want to ${confirmModal.type} ${confirmModal.name}?`}
        confirmText={confirmModal.type === 'ban' ? 'Ban Vendor' : confirmModal.type === 'approve' ? 'Approve' : 'Confirm'}
        variant={confirmModal.type === 'approve' || confirmModal.type === 'activate' ? 'info' : 'danger'}
      />

      {/* Commission Edit Modal - simplified inline implementation for now */}
      {commissionModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md p-6 border border-gray-100 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Update Commission Rate
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Set the percentage of sales that the platform takes as commission from <strong>{commissionModal.name}</strong>.
            </p>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Commission Percentage (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={newCommissionRate}
                  onChange={(e) => setNewCommissionRate(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-lg font-bold"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">
                  %
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                Vendor will receive <strong>{100 - newCommissionRate}%</strong> of each sale.
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setCommissionModal(prev => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateCommission}
                className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminVendorsPage;
