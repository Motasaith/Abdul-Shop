import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchOrder, cancelOrder } from '../store/slices/orderSlice';
import { formatPrice } from '../utils/currency';
import toast from 'react-hot-toast';
import Modal from '../components/common/Modal';

const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { order: currentOrder, loading, error } = useAppSelector((state) => state.orders);
  const [isCancelModalOpen, setIsCancelModalOpen] = React.useState(false);

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'Shipped':
        return 'bg-blue-100 text-blue-800';
      case 'Delivered':
        return 'bg-green-100 text-green-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Error: {error}
        </div>
      </div>
    );
  }

  if (!currentOrder) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Order not found</h2>
          <Link
            to="/orders"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Order #{currentOrder._id.slice(-8)}
            </h1>
            <p className="text-gray-600 mt-1">
              Placed on {formatDate(currentOrder.createdAt)}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(currentOrder.orderStatus)}`}>
              {currentOrder.orderStatus}
            </span>
            <Link
              to={`/track/${currentOrder.trackingNumber || currentOrder._id}`}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 mr-3 print:hidden"
            >
              Track Package
            </Link>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 mr-3 print:hidden"
            >
              Print Receipt
            </button>
            <Link
              to="/orders"
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 print:hidden"
            >
              Back to Orders
            </Link>
            {currentOrder.orderStatus === 'Processing' && (
              <button
                onClick={() => setIsCancelModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 print:hidden"
              >
                Cancel Order
              </button>
            )}
          </div>
        </div>

        <Modal
          isOpen={isCancelModalOpen}
          onClose={() => setIsCancelModalOpen(false)}
          title="Cancel Order"
          actionButton={
            <button
              type="button"
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={handleCancelOrder}
            >
              Confirm Cancellation
            </button>
          }
        >
          <p className="text-sm text-gray-500">
            Are you sure you want to cancel this order? This action cannot be undone.
          </p>
        </Modal>

        {/* Print Styles */}
        <style>
          {`
            @media print {
              @page { margin: 2cm; }
              body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
              .print\\:hidden { display: none !important; }
              header, footer { display: none !important; }
            }
          `}
        </style>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Order Items</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {currentOrder.orderItems.map((item: any, index: number) => (
                  <div key={index} className="px-6 py-4 flex items-center space-x-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-md"
                    />
                    <div className="flex-1">
                      <Link to={`/products/${item.product}`} className="text-sm font-medium text-gray-900 hover:text-blue-600">
                        {item.name}
                      </Link>
                      <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                      {currentOrder.isDelivered && (
                        <Link 
                          to={`/products/${item.product}?review=true`}
                          className="text-xs text-orange-600 hover:text-orange-700 font-medium mt-1 inline-block print:hidden"
                        >
                          Write a Review
                        </Link>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatPrice(item.price)} each
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            {/* Payment & Delivery Status */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Status</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Payment</span>
                  <span className={`text-sm font-medium ${currentOrder.isPaid ? 'text-green-600' : 'text-red-600'}`}>
                    {currentOrder.isPaid ? 'Paid' : 'Not Paid'}
                  </span>
                </div>
                {currentOrder.isPaid && currentOrder.paidAt && (
                  <p className="text-xs text-gray-500">
                    Paid on {formatDate(currentOrder.paidAt)}
                  </p>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Delivery</span>
                  <span className={`text-sm font-medium ${currentOrder.isDelivered ? 'text-green-600' : 'text-gray-600'}`}>
                    {currentOrder.isDelivered ? 'Delivered' : 'Not Delivered'}
                  </span>
                </div>
                {currentOrder.isDelivered && currentOrder.deliveredAt && (
                  <p className="text-xs text-gray-500">
                    Delivered on {formatDate(currentOrder.deliveredAt)}
                  </p>
                )}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipping Address</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p>{(currentOrder.shippingAddress as any).address}</p>
                <p>
                  {currentOrder.shippingAddress.city}, {(currentOrder.shippingAddress as any).state} {(currentOrder.shippingAddress as any).postalCode}
                </p>
                <p>{currentOrder.shippingAddress.country}</p>
                {currentOrder.shippingAddress.phone && (
                  <p>Phone: {currentOrder.shippingAddress.phone}</p>
                )}
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900">{formatPrice(currentOrder.itemsPrice)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-gray-900">{formatPrice(currentOrder.shippingPrice)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax</span>
                  <span className="text-gray-900">{formatPrice(currentOrder.taxPrice)}</span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-base font-semibold">
                    <span className="text-gray-900">Total</span>
                    <span className="text-gray-900">{formatPrice(currentOrder.totalPrice)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h3>
              <p className="text-sm text-gray-600">{currentOrder.paymentMethod}</p>
            </div>

            {/* Tracking Info */}
            {currentOrder.trackingNumber && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Tracking</h3>
                <p className="text-sm text-gray-600">
                  Tracking Number: <span className="font-medium">{currentOrder.trackingNumber}</span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
