import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import adminService from '../../services/adminService';
import orderService from '../../services/orderService';
import { toast } from 'react-hot-toast';
import { usePrice } from '../../hooks/usePrice';
import { Order } from '../../types';
import OrderDetailsModal from '../../components/admin/OrderDetailsModal';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { 
  Search, 
  Filter, 
  RefreshCw, 
  ChevronDown, 
  Eye, 
  Edit, 
  Package, 
  Truck, 
  CheckCircle, 
  XCircle, 
  Clock,
  DollarSign,
  AlertCircle,
  Calendar
} from 'lucide-react';

const AdminOrders: React.FC = () => {
  const { formatPrice } = usePrice();
  const [orders, setOrders] = useState<Order[]>([]);
  const [limitStats, setLimitStats] = useState({ totalRevenue: 0, lostRevenue: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  
  // Modal State
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const statusOptions = ['all', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await adminService.getOrders({
        status: selectedStatus === 'all' ? '' : selectedStatus,
        search: debouncedSearchTerm
      });
      setOrders(data.orders || []);
      setLimitStats({
        totalRevenue: data.totalRevenue || 0,
        lostRevenue: data.lostRevenue || 0
      });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [selectedStatus, debouncedSearchTerm]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await adminService.updateOrderStatus(orderId, newStatus);
      setOrders(orders.map(order => 
        order._id === orderId 
          ? { 
              ...order, 
              orderStatus: newStatus as any,
              isDelivered: newStatus === 'Delivered' ? true : order.isDelivered,
              deliveredAt: newStatus === 'Delivered' ? new Date().toISOString() : order.deliveredAt
            }
          : order
      ));
      toast.success(`Order marked as ${newStatus}`);
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  const handleViewOrder = async (orderId: string) => {
    try {
      const response = await orderService.getOrder(orderId);
      setSelectedOrder(response.data);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast.error('Failed to load order details');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Processing': return Clock;
      case 'Shipped': return Truck;
      case 'Delivered': return CheckCircle;
      case 'Cancelled': return XCircle;
      default: return AlertCircle;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Processing': return 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/30';
      case 'Shipped': return 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30';
      case 'Delivered': return 'bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30';
      case 'Cancelled': return 'bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-600 dark:text-gray-400 border-gray-500/30';
    }
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.05 
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 }
    }
  };

  return (
    <div className="space-y-6 sm:p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
            Order Management
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Track and manage customer orders
          </p>
        </div>
        <button 
          onClick={fetchOrders} 
          disabled={loading}
          className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-gray-700"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: formatPrice(limitStats.totalRevenue), icon: DollarSign, color: 'text-green-500', bg: 'bg-green-500/10' },
          { label: 'Processing', value: orders.filter(o => o.orderStatus === 'Processing').length, icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
          { label: 'Delivered', value: orders.filter(o => o.orderStatus === 'Delivered').length, icon: CheckCircle, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Lost Revenue', value: formatPrice(limitStats.lostRevenue), icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-500/10' },
        ].map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl border border-white/20 dark:border-gray-700/30 p-4 rounded-2xl shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.label}</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</h3>
              </div>
              <div className={`p-3 rounded-xl ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl border border-white/20 dark:border-gray-700/30 p-4 rounded-2xl shadow-lg space-y-4 md:space-y-0 md:flex md:items-center md:gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
          />
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
          {statusOptions.map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                selectedStatus === status
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                  : 'bg-white dark:bg-gray-900/50 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {status === 'all' ? 'All Orders' : status}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl border border-white/20 dark:border-gray-700/30 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/50 dark:bg-gray-900/30 border-b border-gray-100 dark:border-gray-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Order Info</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Items</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody
               className="divide-y divide-gray-100 dark:divide-gray-800"
            >
              {loading ? (
                 <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                       <div className="flex justify-center"><RefreshCw className="w-8 h-8 animate-spin text-blue-500" /></div>
                    </td>
                 </tr>
              ) : orders.length === 0 ? (
                <tr>
                   <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      No orders found matching your criteria.
                   </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const StatusIcon = getStatusIcon(order.orderStatus);
                  return (
                    <tr 
                      key={order._id}
                      className="group hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                           <div className="p-2 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
                              <Package className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                           </div>
                           <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">#{order._id.slice(-6).toUpperCase()}</p>
                              <div className="flex items-center text-xs text-gray-500 mt-1">
                                 <Calendar className="w-3 h-3 mr-1" />
                                 {formatDate(order.createdAt)}
                              </div>
                           </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                         <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold mr-3">
                               {(order.user as any)?.name?.charAt(0) || 'U'}
                            </div>
                            <div>
                               <p className="text-sm font-medium text-gray-900 dark:text-white">{(order.user as any)?.name || 'Guest'}</p>
                               <p className="text-xs text-gray-500">{(order.user as any)?.email}</p>
                            </div>
                         </div>
                      </td>
                      <td className="px-6 py-4">
                         <div className="flex -space-x-2">
                            {order.orderItems.slice(0, 3).map((item, i) => (
                               <img key={i} src={item.image} alt={item.name} className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 object-cover" title={item.name} />
                            ))}
                            {order.orderItems.length > 3 && (
                               <div className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xs font-medium text-gray-500">
                                  +{order.orderItems.length - 3}
                               </div>
                            )}
                         </div>
                         <p className="text-xs text-gray-500 mt-1">{order.orderItems.length} items</p>
                      </td>
                      <td className="px-6 py-4">
                         <p className="text-sm font-bold text-gray-900 dark:text-white">{formatPrice(order.totalPrice)}</p>
                         <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mt-1 ${order.isPaid ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
                            {order.isPaid ? 'Paid' : 'Unpaid'}
                         </span>
                      </td>
                      <td className="px-6 py-4">
                         <div className="relative group/status inline-block">
                            <select
                               value={order.orderStatus}
                               onChange={(e) => handleStatusChange(order._id, e.target.value)}
                               className={`appearance-none pl-8 pr-8 py-1.5 rounded-full text-xs font-semibold border focus:ring-2 focus:ring-offset-1 cursor-pointer transition-all ${getStatusColor(order.orderStatus)}`}
                            >
                               {statusOptions.slice(1).map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                            <StatusIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" />
                            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none opacity-50" />
                         </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                           <button 
                             onClick={() => handleViewOrder(order._id)}
                             className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                             title="View Details"
                           >
                              <Eye className="w-4 h-4" />
                           </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <OrderDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        order={selectedOrder}
        onUpdate={fetchOrders}
      />
    </div>
  );
};

export default AdminOrders;
