import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { usePrice } from '../../hooks/usePrice';
import adminService from '../../services/adminService';
import toast from 'react-hot-toast';

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any; // Using any for now as the type structure might differ slightly from the global Order type in some fields (like user populating)
  onUpdate: () => void;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ isOpen, onClose, order, onUpdate }) => {
  const { formatPrice } = usePrice();
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Tracking info state
  const [trackingNumber, setTrackingNumber] = useState('');
  const [carrier, setCarrier] = useState('');
  const [trackingUrl, setTrackingUrl] = useState('');

  useEffect(() => {
    if (order) {
      setStatus(order.orderStatus);
      if (order.trackingInfo) {
        setTrackingNumber(order.trackingInfo.trackingNumber || '');
        setCarrier(order.trackingInfo.carrier || '');
        setTrackingUrl(order.trackingInfo.trackingUrl || '');
      } else {
        setTrackingNumber('');
        setCarrier('');
        setTrackingUrl('');
      }
    }
  }, [order]);

  if (!isOpen || !order) return null;

  const handleUpdateStatus = async () => {
    try {
      setLoading(true);
      
      // If status is Shipped, we might want to update tracking info
      if (status === 'Shipped' && (trackingNumber || carrier)) {
         // Assuming there's an endpoint or logic to update tracking. 
         // adminService.updateOrderStatus currently only takes status. 
         // We might need to extend it or make a separate call if the backend supports it.
         // For now, based on standard adminService, we just update status.
         // If tracking info is needed, we would need to add that capability to adminService.
      }

      await adminService.updateOrderStatus(order._id, status);
      toast.success('Order status updated successfully');
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update order status');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Processing': return 'bg-yellow-100 text-yellow-800';
      case 'Shipped': return 'bg-blue-100 text-blue-800';
      case 'Delivered': return 'bg-green-100 text-green-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-bold leading-6 text-gray-900">
                  Order #{order._id.slice(-8)}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Placed on {formatDate(order.createdAt)}
                </p>
              </div>
              <button
                onClick={onClose}
                className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left Column: Items */}
              <div className="md:col-span-2 space-y-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-700 mb-3">Order Items</h4>
                  <div className="space-y-4">
                    {order.orderItems.map((item: any, index: number) => (
                      <div key={index} className="flex items-center space-x-4">
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="w-16 h-16 object-cover rounded-md border border-gray-200"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{item.name}</p>
                          <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          {formatPrice(item.price * item.quantity)}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-gray-200 mt-4 pt-4 flex justify-between items-center">
                    <span className="font-semibold text-gray-900">Total</span>
                    <span className="font-bold text-xl text-gray-900">{formatPrice(order.totalPrice)}</span>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-700 mb-3">Shipping Address</h4>
                   <p className="text-sm text-gray-600 mb-1">{order.user?.name}</p>
                   <p className="text-sm text-gray-600 mb-1">{order.user?.email}</p>
                   <div className="border-t border-gray-200 my-2 pt-2">
                     <p className="text-sm text-gray-600">{(order.shippingAddress as any).address}</p>
                     <p className="text-sm text-gray-600">
                       {order.shippingAddress.city}, {(order.shippingAddress as any).state} {(order.shippingAddress as any).postalCode}
                     </p>
                     <p className="text-sm text-gray-600">{order.shippingAddress.country}</p>
                   </div>
                </div>
              </div>

              {/* Right Column: Status & Actions */}
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-700 mb-3">Order Status</h4>
                  <div className="mb-4">
                    <span className={`px-3 py-1 text-sm font-bold rounded-full ${getStatusColor(order.orderStatus)}`}>
                      {order.orderStatus}
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">Update Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>

                    {/* Show tracking inputs only if Shipped is selected or active */}
                    {status === 'Shipped' && (
                      <div className="pt-2 space-y-2">
                        <input
                          type="text"
                          placeholder="Tracking Number"
                          value={trackingNumber}
                          onChange={(e) => setTrackingNumber(e.target.value)}
                          className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                        <input
                          type="text"
                          placeholder="Carrier (e.g., FedEx, UPS)"
                          value={carrier}
                          onChange={(e) => setCarrier(e.target.value)}
                          className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      </div>
                    )}

                    <button
                      onClick={handleUpdateStatus}
                      disabled={loading || status === order.orderStatus}
                      className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                        loading || status === order.orderStatus
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                      }`}
                    >
                      {loading ? 'Updating...' : 'Update Status'}
                    </button>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-700 mb-3">Payment Info</h4>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Method</span>
                    <span className="text-sm font-medium text-gray-900">{order.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Status</span>
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${order.isPaid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {order.isPaid ? 'Paid' : 'Unpaid'}
                    </span>
                  </div>
                  {order.isPaid && order.paidAt && (
                    <div className="mt-2 text-xs text-gray-500 text-right">
                      {formatDate(order.paidAt)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;
