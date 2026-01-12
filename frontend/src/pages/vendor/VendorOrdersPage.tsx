import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import vendorService from '../../services/vendorService';
import { usePrice } from '../../hooks/usePrice';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { toast } from 'react-hot-toast';
import { apiService } from '../../services/api';
import { 
  Package, 
  Search, 
  Filter, 
  ChevronDown, 
  Eye, 
  Truck, 
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';
import Modal from '../../components/common/Modal';

interface Order {
  _id: string;
  user: {
    name: string;
    email: string;
  };
  totalPrice: number;
  isPaid: boolean;
  isDelivered: boolean;
  isShipped?: boolean;
  createdAt: string;
  orderStatus: string;
  orderItems: Array<{
    name: string;
    quantity: number;
    image: string;
    price: number;
  }>;
}



const VendorOrdersPage: React.FC = () => {
  const { t } = useTranslation();
  const { formatPrice } = usePrice();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  
  // Modal state
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [pendingStatusUpdate, setPendingStatusUpdate] = useState<{ id: string; status: string } | null>(null);

  const fetchOrders = async () => {
    try {
      const data = await vendorService.getVendorOrders();
      setOrders(data);
      setFilteredOrders(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    let result = orders;

    if (searchTerm) {
      result = result.filter(order => 
        order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.user?.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'All') {
      result = result.filter(order => order.orderStatus === statusFilter);
    }

    setFilteredOrders(result);
  }, [searchTerm, statusFilter, orders]);

  const handleStatusChangeRequest = (orderId: string, newStatus: string) => {
    setPendingStatusUpdate({ id: orderId, status: newStatus });
    setIsStatusModalOpen(true);
  };

  const confirmStatusUpdate = async () => {
    if (!pendingStatusUpdate) return;
    
    setUpdatingId(pendingStatusUpdate.id);
    setIsStatusModalOpen(false);
    
    try {
      await apiService.put(`/vendor/orders/${pendingStatusUpdate.id}/status`, { status: pendingStatusUpdate.status });
      toast.success(`Order updated to ${pendingStatusUpdate.status}`);
      fetchOrders(); // Refresh data
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    } finally {
      setUpdatingId(null);
      setPendingStatusUpdate(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Processing':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'Shipped':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'Delivered':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'Cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Order Management</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage and track your customer orders</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by Order ID or Customer..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="text-gray-400 w-5 h-5" />
          <select
            className="border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Status</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Order</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Payment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">#{order._id.slice(-6).toUpperCase()}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{order.orderItems.length} items</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{order.user?.name || 'Guest'}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{order.user?.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        order.isPaid ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                      }`}>
                        {order.isPaid ? 'Paid' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.orderStatus)}`}>
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white">
                      {formatPrice(order.totalPrice)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <select
                          value={order.orderStatus}
                          onChange={(e) => handleStatusChangeRequest(order._id, e.target.value)}
                          disabled={updatingId === order._id}
                          className="text-xs border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50"
                        >
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                        <Link to={`/orders/${order._id}`} className="p-1 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300">
                          <Eye className="w-5 h-5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    <Package className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                    <p className="text-lg font-medium">No orders found</p>
                    <p className="text-sm">Try adjusting your search or filters</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Status Confirmation Modal */}
      <Modal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        title="Update Order Status"
        actionButton={
          <button
            type="button"
            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
            onClick={confirmStatusUpdate}
          >
            Confirm Update
          </button>
        }
      >
        <div className="flex items-start gap-4">
            <div className={`p-2 rounded-full ${pendingStatusUpdate?.status === 'Cancelled' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                {pendingStatusUpdate?.status === 'Cancelled' ? (
                  <AlertCircle className="w-6 h-6" />
                ) : (
                  <Truck className="w-6 h-6" />
                )}
            </div>
            <div>
               <p className="text-gray-500 dark:text-gray-400 mt-1">
                  Are you sure you want to change the status of this order to <span className="font-bold text-gray-900 dark:text-white">{pendingStatusUpdate?.status}</span>?
               </p>
               {pendingStatusUpdate?.status === 'Shipped' && (
                 <p className="text-xs text-gray-400 mt-2">This will notify the customer that their order is on the way.</p>
               )}
            </div>
        </div>
      </Modal>
    </div>
  );
};

export default VendorOrdersPage;
