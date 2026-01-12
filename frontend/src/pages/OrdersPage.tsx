import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchOrders } from '../store/slices/orderSlice';
import { usePrice } from '../hooks/usePrice';
import { 
  Package, 
  Truck, 
  CheckCircle, 
  AlertCircle, 
  ShoppingBag, 
  Clock, 
  ChevronRight,
  Receipt
} from 'lucide-react';

interface Order {
  _id: string;
  orderItems: Array<{
    name: string;
    quantity: number;
    price: number;
    image: string;
  }>;
  totalPrice: number;
  isPaid: boolean;
  isDelivered: boolean;
  createdAt: string;
  orderStatus: string;
}

const OrdersPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { orders, loading, error } = useAppSelector((state) => state.orders);
  const { formatPrice } = usePrice();

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Processing':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800';
      case 'Shipped':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 border border-blue-200 dark:border-blue-800';
      case 'Delivered':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 border border-green-200 dark:border-green-800';
      case 'Cancelled':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 border border-red-200 dark:border-red-800';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 dark:border-primary-400"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 py-8">
         <div className="max-w-4xl mx-auto bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-800 text-red-800 dark:text-red-200 px-6 py-4 rounded-xl flex items-center">
            <AlertCircle className="w-5 h-5 mr-3" />
            <span>Error: {error}</span>
         </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-12 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-8">
           <div className="p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700/50">
             <ShoppingBag className="w-6 h-6 text-blue-600 dark:text-blue-400" />
           </div>
           <div>
             <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Orders</h1>
             <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Track and manage your recent purchases</p>
           </div>
        </div>
        
        {orders.length === 0 ? (
          <div className="text-center py-24 bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700/50">
            <div className="w-20 h-20 mx-auto mb-6 bg-gray-50 dark:bg-gray-700/50 rounded-full flex items-center justify-center">
              <Package className="w-10 h-10 text-gray-400 dark:text-gray-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No orders yet</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm mx-auto">It looks like you haven't placed any orders yet. Start exploring our collection!</p>
            <Link
              to="/products"
              className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order: Order) => (
              <div key={order._id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/50 overflow-hidden hover:shadow-md transition-shadow duration-300">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700/50 flex flex-wrap items-center justify-between gap-4 bg-gray-50/50 dark:bg-gray-800">
                  <div className="flex items-center gap-4">
                     <div className="flex items-center gap-2">
                        <Receipt className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-mono font-medium text-gray-900 dark:text-white">
                          #{order._id.slice(-8).toUpperCase()}
                        </span>
                     </div>
                     <div className="hidden sm:block w-px h-4 bg-gray-300 dark:bg-gray-600"></div>
                     <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <Clock className="w-4 h-4" />
                        {formatDate(order.createdAt)}
                     </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                     <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wide rounded-full ${getStatusColor(order.orderStatus)}`}>
                        {order.orderStatus}
                     </span>
                     <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {formatPrice(order.totalPrice)}
                     </p>
                  </div>
                </div>
                
                <div className="px-6 py-5">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="flex items-center space-x-4 w-full sm:w-auto">
                      <div className="flex -space-x-3">
                        {order.orderItems.slice(0, 3).map((item, index) => (
                          <div key={index} className="relative z-0 hover:z-10 transition-all duration-200">
                             <img
                                className="w-14 h-14 rounded-full border-2 border-white dark:border-gray-800 object-cover shadow-sm"
                                src={item.image}
                                alt={item.name}
                              />
                          </div>
                        ))}
                        {order.orderItems.length > 3 && (
                          <div className="w-14 h-14 rounded-full border-2 border-white dark:border-gray-800 bg-gray-100 dark:bg-gray-700 flex items-center justify-center z-0">
                            <span className="text-xs font-bold text-gray-600 dark:text-gray-300">
                              +{order.orderItems.length - 3}
                            </span>
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1">
                          {order.orderItems[0].name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {order.orderItems.length} item{order.orderItems.length > 1 ? 's' : ''} • {formatPrice(order.totalPrice)}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className={`text-xs font-medium flex items-center gap-1.5 ${order.isPaid ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                             {order.isPaid ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                             {order.isPaid ? 'Paid' : 'Payment Pending'}
                          </span>
                          <span className={`text-xs font-medium flex items-center gap-1.5 ${order.isDelivered ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'}`}>
                             <Truck className="w-3 h-3" />
                             {order.isDelivered ? 'Delivered' : 'In Transit'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="w-full sm:w-auto">
                      <Link
                        to={`/orders/${order._id}`}
                        className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 border border-gray-200 dark:border-gray-600 text-sm font-bold rounded-xl text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors group"
                      >
                        View Details
                        <ChevronRight className="w-4 h-4 ml-1.5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200 transition-colors" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
