import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import orderService from '../services/orderService';
import { formatPrice } from '../utils/currency';

interface TrackingEvent {
  status: string;
  description: string;
  date: string;
  completed: boolean;
  estimated?: boolean;
  trackingUrl?: string;
}

interface TrackedOrder {
  _id: string;
  orderItems: Array<{
    name: string;
    quantity: number;
    image: string;
    price: number;
  }>;
  shippingAddress: {
    address: string;
    city: string;
    postalCode: string;
    country: string;
    state?: string;
  };
  totalPrice: number;
  orderStatus: string;
  isPaid: boolean;
  isShipped: boolean;
  isDelivered: boolean;
  paidAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  trackingInfo?: {
    trackingNumber: string;
    carrier: string;
    trackingUrl: string;
  };
  estimatedDelivery?: string;
  createdAt: string;
  trackingHistory: TrackingEvent[];
}

const TrackOrderPage: React.FC = () => {
  const { trackingNumber } = useParams<{ trackingNumber: string }>();
  const navigate = useNavigate();
  
  const [searchInput, setSearchInput] = useState(trackingNumber || '');
  const [searchEmail, setSearchEmail] = useState('');
  const [searchType, setSearchType] = useState<'tracking' | 'order'>('tracking');
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (trackingNumber) {
      handleTrackOrder(trackingNumber);
    }
  }, [trackingNumber]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchInput.trim()) {
      toast.error('Please enter a tracking number or order ID');
      return;
    }

    if (searchType === 'order' && !searchEmail.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (searchType === 'tracking') {
        await handleTrackOrder(searchInput.trim());
      } else {
        const response = await orderService.trackOrderById(searchInput.trim(), searchEmail.trim());
        if (response.data.success) {
          navigate(`/track/${response.data.trackingId}`);
        }
      }
    } catch (err: any) {
      console.error('Track order error:', err);
      const errorMsg = err.response?.data?.msg || err.response?.data?.message || 'Failed to track order';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleTrackOrder = async (trackingId: string) => {
    setLoading(true);
    setError('');

    try {
      const response = await orderService.trackOrder(trackingId);
      setOrder(response.data);
    } catch (err: any) {
      console.error('Track order error:', err);
      const errorMsg = err.response?.data?.msg || err.response?.data?.message || 'Order not found';
      setError(errorMsg);
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'order placed':
        return 'bg-blue-500';
      case 'payment confirmed':
        return 'bg-green-500';
      case 'processing':
        return 'bg-yellow-500';
      case 'shipped':
        return 'bg-purple-500';
      case 'out for delivery':
        return 'bg-orange-500';
      case 'delivered':
        return 'bg-green-600';
      default:
        return 'bg-gray-500';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            📦 Track Your Order
          </h1>
          <p className="text-lg text-gray-600">
            Enter your tracking number or order details to get real-time updates
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="mb-6">
            <div className="flex justify-center space-x-4 mb-6">
              <button
                type="button"
                onClick={() => setSearchType('tracking')}
                className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                  searchType === 'tracking'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                By Tracking Number
              </button>
              <button
                type="button"
                onClick={() => setSearchType('order')}
                className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                  searchType === 'order'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                By Order ID
              </button>
            </div>
          </div>

          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {searchType === 'tracking' ? 'Tracking Number' : 'Order ID'}
              </label>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder={
                  searchType === 'tracking' 
                    ? 'Enter your tracking number (e.g., TRK123456789)'
                    : 'Enter your order ID (e.g., 507f1f77bcf86cd799439011)'
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {searchType === 'order' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  placeholder="Enter the email used for this order"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Tracking...
                </div>
              ) : (
                'Track Order'
              )}
            </button>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Order Information */}
        {order && (
          <div className="space-y-8">
            {/* Order Summary */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Order ID:</span>
                      <span className="font-mono text-gray-900">#{order._id.slice(-8).toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Order Date:</span>
                      <span className="text-gray-900">{formatDate(order.createdAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Amount:</span>
                      <span className="font-semibold text-gray-900">{formatPrice(order.totalPrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        order.isDelivered ? 'bg-green-100 text-green-800' :
                        order.isShipped ? 'bg-blue-100 text-blue-800' :
                        order.isPaid ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.orderStatus}
                      </span>
                    </div>
                    {order.trackingInfo?.trackingNumber && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tracking Number:</span>
                        <span className="font-mono text-gray-900">{order.trackingInfo.trackingNumber}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipping Address</h3>
                  <div className="text-sm text-gray-600">
                    <div>{order.shippingAddress.address}</div>
                    <div>
                      {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                    </div>
                    <div>{order.shippingAddress.country}</div>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Items Ordered</h3>
                <div className="space-y-4">
                  {order.orderItems.map((item, index) => (
                    <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{item.name}</h4>
                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Tracking Timeline */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Tracking Timeline</h2>
                {order.trackingInfo?.trackingUrl && (
                  <a
                    href={order.trackingInfo.trackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Track with {order.trackingInfo.carrier}
                  </a>
                )}
              </div>

              <div className="relative">
                {order.trackingHistory.map((event, index) => (
                  <div key={index} className="relative pb-8">
                    {index !== order.trackingHistory.length - 1 && (
                      <span
                        className={`absolute top-5 left-5 -ml-px h-full w-0.5 ${
                          event.completed ? 'bg-blue-600' : 'bg-gray-300'
                        }`}
                        aria-hidden="true"
                      />
                    )}
                    <div className="relative flex items-start group">
                      <span className="h-9 flex items-center" aria-hidden="true">
                        <span
                          className={`relative z-10 w-8 h-8 flex items-center justify-center rounded-full ${
                            event.completed
                              ? `${getStatusColor(event.status)} text-white`
                              : event.estimated
                              ? 'bg-gray-200 text-gray-500 border-2 border-dashed border-gray-400'
                              : 'bg-white border-2 border-gray-300 text-gray-400'
                          }`}
                        >
                          {event.completed ? (
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          ) : (
                            <span className="h-2.5 w-2.5 bg-current rounded-full" />
                          )}
                        </span>
                      </span>
                      <div className="min-w-0 flex-1 py-1.5 ml-4">
                        <div className="text-sm text-gray-500 flex items-center space-x-2">
                          <span className={`font-medium ${event.completed ? 'text-gray-900' : 'text-gray-600'}`}>
                            {event.status}
                          </span>
                          {event.estimated && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              Estimated
                            </span>
                          )}
                        </div>
                        <div className="mt-1 text-sm text-gray-700">
                          {event.description}
                        </div>
                        {event.date && (
                          <div className="mt-1 text-xs text-gray-500">
                            {formatDate(event.date)}
                          </div>
                        )}
                        {event.trackingUrl && (
                          <div className="mt-2">
                            <a
                              href={event.trackingUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center text-sm text-blue-600 hover:text-blue-500"
                            >
                              View on carrier website
                              <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Need Help */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Need Help with Your Order?
                </h3>
                <p className="text-gray-600 mb-6">
                  If you have any questions or concerns about your order, our customer support team is here to help.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => navigate('/contact')}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.955 8.955 0 01-2.966-.5c-.48-.15-.96-.3-1.428-.458L7.548 21l.472-1.76C6.858 18.284 6 15.222 6 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
                    </svg>
                    Contact Support
                  </button>
                  <button
                    onClick={() => navigate('/help')}
                    className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Help Center
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackOrderPage;
