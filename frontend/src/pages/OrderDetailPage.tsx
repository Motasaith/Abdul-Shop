import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchOrder, cancelOrder } from '../store/slices/orderSlice';
import { usePrice } from '../hooks/usePrice';
import toast from 'react-hot-toast';
import Modal from '../components/common/Modal';
import { 
    Package, 
    Printer, 
    ArrowLeft, 
    XCircle, 
    MapPin, 
    CreditCard, 
    Calendar,
    Truck,
    CheckCircle,
    Info,
    AlertCircle
} from 'lucide-react';

const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { order: currentOrder, loading, error } = useAppSelector((state) => state.orders);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const { formatPrice } = usePrice();

  useEffect(() => {
    if (id) {
      dispatch(fetchOrder(id));
    }
  }, [dispatch, id]);

  const handleCancelOrder = async () => {
    if (currentOrder) {
      await dispatch(cancelOrder(currentOrder._id));
      toast.success('Order cancelled successfully');
      setIsCancelModalOpen(false);
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

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Processing':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800';
      case 'Shipped':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800';
      case 'Delivered':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700';
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

  if (!currentOrder) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center items-center px-4">
          <Package className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Order not found</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">The order you are looking for does not exist or has been removed.</p>
          <Link
            to="/orders"
            className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Orders
          </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-12 transition-colors duration-300 print:bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 print:hidden">
          <div>
             <div className="flex items-center gap-3 mb-2">
                <Link to="/orders" className="p-2 -ml-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                   <ArrowLeft className="w-5 h-5" />
                </Link>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                  Order Details
                </h1>
             </div>
             <p className="text-gray-500 dark:text-gray-400">Order ID: #{currentOrder._id.slice(-8).toUpperCase()}</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
             <span className={`px-4 py-1.5 text-sm font-bold rounded-full ${getStatusStyle(currentOrder.orderStatus)}`}>
               {currentOrder.orderStatus}
             </span>
             
             <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 text-sm font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <Printer className="w-4 h-4 mr-2" /> Print
                </button>
                
                <Link
                  to={`/track/${currentOrder.trackingNumber || currentOrder._id}`}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors shadow-lg shadow-blue-500/20"
                >
                  <Truck className="w-4 h-4 mr-2" /> Track Series
                </Link>

                {currentOrder.orderStatus === 'Processing' && (
                  <button
                    onClick={() => setIsCancelModalOpen(true)}
                    className="inline-flex items-center px-4 py-2 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 text-sm font-bold rounded-xl transition-colors"
                  >
                    <XCircle className="w-4 h-4 mr-2" /> Cancel
                  </button>
                )}
             </div>
          </div>
        </div>

        <Modal
          isOpen={isCancelModalOpen}
          onClose={() => setIsCancelModalOpen(false)}
          title="Cancel Order"
          actionButton={
            <button
              type="button"
              className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={handleCancelOrder}
            >
              Confirm Cancellation
            </button>
          }
        >
          <div className="flex items-start gap-4">
              <div className="p-2 bg-red-100 rounded-full text-red-600">
                  <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                 <p className="text-gray-500 dark:text-gray-400 mt-1">
                    Are you sure you want to cancel this order? This action cannot be undone and you may lose your reserved items.
                 </p>
              </div>
          </div>
        </Modal>

        {/* Print Styles */}
        <style>
          {`
            @media print {
              @page { margin: 1cm; size: auto; }
              body { print-color-adjust: exact; -webkit-print-color-adjust: exact; background: white; }
              .print\\:hidden { display: none !important; }
              .print\\:bg-white { background-color: white !important; }
              nav, footer, .sidebar { display: none !important; }
            }
          `}
        </style>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Items */}
          <div className="lg:col-span-2 space-y-6">
             {/* Items List */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700/50 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700/50 flex items-center gap-3">
                <Package className="w-5 h-5 text-gray-400" />
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Order Items ({currentOrder.orderItems.length})</h2>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
                {currentOrder.orderItems.map((item: any, index: number) => (
                  <div key={index} className="px-6 py-5 flex flex-col sm:flex-row items-center gap-6 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-24 h-24 object-cover rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm"
                    />
                    <div className="flex-1 text-center sm:text-left">
                      <Link to={`/products/${item.product}`} className="text-base font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 line-clamp-2">
                        {item.name}
                      </Link>
                      <div className="flex items-center justify-center sm:justify-start gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                          <span className="bg-gray-100 dark:bg-gray-700/50 px-2 py-1 rounded-md">Qty: {item.quantity}</span>
                          <span>{formatPrice(item.price)} each</span>
                      </div>
                      
                      {currentOrder.isDelivered && (
                        <Link 
                          to={`/products/${item.product}?review=true`}
                          className="mt-3 inline-flex items-center text-sm font-medium text-orange-600 dark:text-orange-500 hover:text-orange-700 dark:hover:text-orange-400 print:hidden"
                        >
                           <span className="mr-1">★</span> Write a Review
                        </Link>
                      )}
                    </div>
                    <div className="text-right min-w-[100px]">
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tracking (if valid) */}
            {currentOrder.trackingNumber && (
              <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700/50 p-6">
                <div className="flex items-center gap-3 mb-4">
                     <Truck className="w-5 h-5 text-blue-500" />
                     <h3 className="text-lg font-bold text-gray-900 dark:text-white">Shipment Tracking</h3>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 flex items-center justify-between">
                   <div>
                       <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Tracking Number</p>
                       <p className="text-lg font-mono font-medium text-gray-900 dark:text-white">{currentOrder.trackingNumber}</p>
                   </div>
                   <button onClick={() => {if(currentOrder.trackingNumber) {navigator.clipboard.writeText(currentOrder.trackingNumber); toast.success("Copied!");}}} className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">
                      Copy
                   </button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
             {/* Order Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700/50 p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-5">Order Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                  <span className="font-medium text-gray-900 dark:text-white">{formatPrice(currentOrder.itemsPrice)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                      {currentOrder.shippingPrice === 0 ? <span className="text-green-600">Free</span> : formatPrice(currentOrder.shippingPrice)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Tax</span>
                  <span className="font-medium text-gray-900 dark:text-white">{formatPrice(currentOrder.taxPrice)}</span>
                </div>
                <div className="border-t border-gray-100 dark:border-gray-700/50 pt-3 mt-2">
                  <div className="flex justify-between text-base font-bold">
                    <span className="text-gray-900 dark:text-white">Total</span>
                    <span className="text-blue-600 dark:text-blue-400 text-xl">{formatPrice(currentOrder.totalPrice)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Cards */}
            <div className="grid grid-cols-1 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${currentOrder.isPaid ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                           {currentOrder.isPaid ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider">Payment Status</p>
                            <p className={`font-bold ${currentOrder.isPaid ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-500'}`}>
                                {currentOrder.isPaid ? 'Paid' : 'Pending'}
                            </p>
                        </div>
                    </div>
                </div>

                 <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${currentOrder.isDelivered ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                           <Truck className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider">Delivery Status</p>
                            <p className={`font-bold ${currentOrder.isDelivered ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'}`}>
                                {currentOrder.isDelivered ? 'Delivered' : currentOrder.orderStatus}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Shipping & Payment Info */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700/50 overflow-hidden">
               <div className="p-5 border-b border-gray-100 dark:border-gray-700/50">
                   <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                       <MapPin className="w-4 h-4 text-gray-400" /> Shipping Details
                   </h3>
               </div>
               <div className="p-5 space-y-4">
                  <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">{(currentOrder.shippingAddress as any).name || 'Customer'}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{(currentOrder.shippingAddress as any).address}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                         {currentOrder.shippingAddress.city}, {(currentOrder.shippingAddress as any).postalCode}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{currentOrder.shippingAddress.country}</p>
                      {(currentOrder.shippingAddress as any).phone && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-2">
                           <span className="w-1 h-1 rounded-full bg-gray-400"></span> {(currentOrder.shippingAddress as any).phone}
                        </p>
                      )}
                  </div>
               </div>
               
               <div className="p-5 border-t border-gray-100 dark:border-gray-700/50 bg-gray-50 dark:bg-gray-900/30">
                   <div className="flex items-start gap-3">
                       <CreditCard className="w-5 h-5 text-gray-400 mt-0.5" />
                       <div>
                           <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold">Payment Method</p>
                           <p className="text-sm font-medium text-gray-900 dark:text-white">{currentOrder.paymentMethod}</p>
                           {currentOrder.isPaid && currentOrder.paidAt && (
                               <p className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center gap-1">
                                   <CheckCircle className="w-3 h-3" /> Paid on {formatDate(currentOrder.paidAt as string)}
                               </p>
                           )}
                       </div>
                   </div>
               </div>
            </div>
            
             <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700/50 flex items-center justify-center text-gray-500 dark:text-gray-400 text-sm">
                <Calendar className="w-4 h-4 mr-2" />
                Placed: {formatDate(currentOrder.createdAt)}
             </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
