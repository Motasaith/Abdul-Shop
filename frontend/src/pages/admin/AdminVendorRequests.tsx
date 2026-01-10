import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { User } from '../../types';

import Modal from '../../components/common/Modal';

const AdminVendorRequests: React.FC = () => {
  const [requests, setRequests] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [confirmDetails, setConfirmDetails] = useState<{
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
    setConfirmDetails({ isOpen: true, type: 'approve', id, name });
  };

  const openRejectModal = (id: string, name: string) => {
    setConfirmDetails({ isOpen: true, type: 'reject', id, name });
  };

  const processVendorAction = async () => {
    const { id, name, type } = confirmDetails;
    setConfirmDetails(prev => ({ ...prev, isOpen: false }));
    setProcessingId(id);

    try {
      if (type === 'approve') {
        await api.put(`/admin/vendors/${id}/approve`);
        toast.success(`${name} approved successfully`);
      } else {
        await api.put(`/admin/vendors/${id}/reject`);
        toast.success(`${name}'s application rejected`);
      }
      fetchRequests(); // Refresh list
    } catch (error) {
      console.error(`Error ${type}ing vendor:`, error);
      toast.error(`Failed to ${type} vendor`);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Vendor Applications</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage new vendor registration requests</p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-lg font-medium self-start sm:self-auto">
          {requests.length} Pending Requests
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden transition-colors duration-200">
        {requests.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            No pending vendor applications found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Applicant
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Shop Details
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Contact
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Date Applied
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {requests.map((request) => (
                  <tr key={request._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-400 font-bold">
                          {request.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{request.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">ID: {request._id.slice(-6)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white font-medium">{request.vendorDetails?.shopName || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{request.email}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{request.phone || 'No phone'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => openApproveModal(request._id, request.name)}
                        disabled={processingId === request._id}
                        className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300 mr-4 disabled:opacity-50"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => openRejectModal(request._id, request.name)}
                        disabled={processingId === request._id}
                        className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={confirmDetails.isOpen}
        onClose={() => setConfirmDetails(prev => ({ ...prev, isOpen: false }))}
        title={confirmDetails.type === 'approve' ? 'Approve Vendor' : 'Reject Vendor'}
        actionButton={
          <button
            type="button"
            className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm ${
              confirmDetails.type === 'approve' 
                ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500' 
                : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
            }`}
            onClick={processVendorAction}
          >
            {confirmDetails.type === 'approve' ? 'Approve' : 'Reject'}
          </button>
        }
      >
        <p className="text-sm text-gray-500 dark:text-gray-300">
          Are you sure you want to {confirmDetails.type} <span className="font-semibold text-gray-900 dark:text-white">{confirmDetails.name}</span>?
          {confirmDetails.type === 'approve' 
            ? ' They will get access to the vendor dashboard immediately.' 
            : ' This action cannot be undone.'}
        </p>
      </Modal>
    </div>
  );
};

export default AdminVendorRequests;
