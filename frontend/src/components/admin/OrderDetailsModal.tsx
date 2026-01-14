import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  MapPin, 
  Package, 
  Truck, 
  CreditCard, 
  Calendar, 
  User, 
  Mail,
  CheckCircle,
  AlertCircle,
  Clock,
  ExternalLink,
  Printer,
  FileText
} from 'lucide-react';
import { usePrice } from '../../hooks/usePrice';
import adminService from '../../services/adminService';
import toast from 'react-hot-toast';
import ConfirmationModal from '../common/ConfirmationModal';

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
  onUpdate: () => void;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ isOpen, onClose, order, onUpdate }) => {
  const { formatPrice } = usePrice();
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Confirmation Modal state
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => Promise<void>) | null>(null);

  // Tracking info state
  const [trackingNumber, setTrackingNumber] = useState('');
  const [carrier, setCarrier] = useState('');
  const [trackingUrl, setTrackingUrl] = useState('');

  // Effect to update local state when order changes
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

  // Helper function definitions
  const handleUpdateStatus = async () => {
    try {
      setLoading(true);
      await adminService.updateOrderStatus(order._id, status);
      toast.success(`Order status updated to ${status}`);
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update order status');
    } finally {
      setLoading(false);
    }
  };

  const handlePrintReceipt = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Order Receipt #${order._id}</title>
            <style>
              body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #333; max-width: 800px; margin: 0 auto; }
              .header { border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: start; }
              .header h1 { margin: 0; color: #1a1a1a; font-size: 28px; }
              .meta { text-align: right; color: #666; font-size: 14px; }
              .section { margin-bottom: 30px; }
              .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 30px; }
              h3 { font-size: 14px; text-transform: uppercase; color: #666; border-bottom: 1px solid #eee; padding-bottom: 10px; margin-bottom: 15px; }
              p { margin: 5px 0; font-size: 14px; line-height: 1.5; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
              th { text-align: left; padding: 12px; background: #f9fafb; font-size: 12px; text-transform: uppercase; color: #666; font-weight: 600; border-bottom: 1px solid #e5e7eb; }
              td { padding: 12px; border-bottom: 1px solid #e5e7eb; font-size: 14px; }
              .text-right { text-align: right; }
              .summary { width: 300px; margin-left: auto; }
              .summary-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
              .summary-row.total { border-bottom: none; border-top: 2px solid #333; margin-top: 10px; padding-top: 15px; font-weight: bold; font-size: 18px; }
              .footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #999; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="header">
              <div>
                <h1>Order Receipt</h1>
                <p>#${order._id}</p>
              </div>
              <div class="meta">
                <p>Date: ${new Date(order.createdAt).toLocaleDateString()}</p>
                <p>Status: ${order.orderStatus}</p>
              </div>
            </div>

            <div class="grid">
              <div>
                <h3>Billed To</h3>
                <p><strong>${order.user?.name}</strong></p>
                <p>${order.user?.email}</p>
              </div>
              <div>
                <h3>Shipped To</h3>
                <p><strong>${order.shippingAddress.address}</strong></p>
                <p>${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}</p>
                <p>${order.shippingAddress.country}</p>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th class="text-right">Price</th>
                  <th class="text-right">Qty</th>
                  <th class="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                ${order.orderItems.map((item: any) => `
                  <tr>
                    <td>${item.name}</td>
                    <td class="text-right">${formatPrice(item.price)}</td>
                    <td class="text-right">${item.quantity}</td>
                    <td class="text-right">${formatPrice(item.price * item.quantity)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <div class="summary">
              <div class="summary-row">
                <span>Subtotal</span>
                <span>${formatPrice(order.itemsPrice || order.totalPrice)}</span>
              </div>
              <div class="summary-row">
                <span>Shipping</span>
                <span>${formatPrice(order.shippingPrice || 0)}</span>
              </div>
              <div class="summary-row">
                <span>Tax</span>
                <span>${formatPrice(order.taxPrice || 0)}</span>
              </div>
              <div class="summary-row total">
                <span>Total</span>
                <span>${formatPrice(order.totalPrice)}</span>
              </div>
            </div>

            <div class="footer">
              <p>Thank you for shopping with us!</p>
            </div>

            <script>
              window.onload = function() { window.print(); }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
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
      case 'Processing': return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900';
      case 'Shipped': return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900';
      case 'Delivered': return 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-200 dark:border-green-900';
      case 'Cancelled': return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900';
      default: return 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Processing': return Clock;
      case 'Shipped': return Truck;
      case 'Delivered': return CheckCircle;
      case 'Cancelled': return AlertCircle;
      default: return Package;
    }
  };

  // Safe to call functions now, but ensure order exists for values
  const StatusIcon = order ? getStatusIcon(order.orderStatus) : Package;

  // Early return if modal is closed
  if (!isOpen || !order) return null;

  return (
    <>
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-all"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700 overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row justify-between items-start gap-4 bg-white/50 dark:bg-gray-800/50">
                <div className="w-full sm:w-auto">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-2">
                    <h2 className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
                      Order #{order._id.slice(-8)}
                    </h2>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1.5 ${getStatusColor(order.orderStatus)}`}>
                      <StatusIcon className="w-3.5 h-3.5" />
                      {order.orderStatus}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Placed on {formatDate(order.createdAt)}
                  </p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto justify-end">
                   <button
                    onClick={handlePrintReceipt}
                    className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 transition-colors"
                    title="Print Receipt"
                  >
                    <Printer className="w-6 h-6" />
                  </button>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Content - Scrollable */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Left Column: Order Items & Customer */}
                  <div className="md:col-span-2 space-y-6">
                    {/* Order Items */}
                    <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <Package className="w-5 h-5 text-blue-500" />
                        Order Items
                      </h3>
                      <div className="space-y-4">
                        {order.orderItems.map((item: any, index: number) => (
                          <div key={index} className="flex items-center gap-4 bg-white dark:bg-gray-900/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700/50">
                            <div className="h-16 w-16 flex-shrink-0 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                              <img 
                                src={item.image} 
                                alt={item.name} 
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="flex-1">
                              <h4 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">{item.name}</h4>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Qty: {item.quantity}</p>
                            </div>
                            <div className="text-sm font-bold text-gray-900 dark:text-white">
                              {formatPrice(item.price * item.quantity)}
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {/* Price Breakdown */}
                      <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700 space-y-2">
                         <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
                            <span>Subtotal (Items)</span>
                            <span>{formatPrice(order.itemsPrice || order.totalPrice - (order.shippingPrice || 0) - (order.taxPrice || 0))}</span>
                         </div>
                         <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
                            <span>Shipping Costs</span>
                            <span>{formatPrice(order.shippingPrice || 0)}</span>
                         </div>
                         <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
                            <span>Estimated Tax</span>
                            <span>{formatPrice(order.taxPrice || 0)}</span>
                         </div>
                         <div className="pt-2 mt-2 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
                            <span className="text-gray-900 dark:text-white font-bold">Total Amount</span>
                            <span className="text-xl font-bold text-blue-600 dark:text-blue-400">{formatPrice(order.totalPrice)}</span>
                         </div>
                      </div>
                    </div>

                    {/* Customer & Shipping */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Customer Info */}
                      <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2 uppercase tracking-wider">
                          <User className="w-4 h-4 text-purple-500" />
                          Customer
                        </h3>
                        <div className="space-y-2">
                          <p className="text-sm text-gray-900 dark:text-white font-medium">{order.user?.name}</p>
                          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                            <Mail className="w-3.5 h-3.5" />
                            {order.user?.email}
                          </div>
                        </div>
                      </div>

                      {/* Shipping Address */}
                      <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2 uppercase tracking-wider">
                          <MapPin className="w-4 h-4 text-red-500" />
                          Shipping Address
                        </h3>
                        <div className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                          <p>{(order.shippingAddress as any).address}</p>
                          <p>
                            {order.shippingAddress.city}, {(order.shippingAddress as any).state} {(order.shippingAddress as any).postalCode}
                          </p>
                          <p>{order.shippingAddress.country}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Actions & Payment */}
                  <div className="space-y-6">
                    {/* Status Management */}
                    <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-orange-500" />
                        Manage Order
                      </h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                            Update Status
                          </label>
                          <div className="relative">
                            <select
                              value={status}
                              onChange={(e) => setStatus(e.target.value)}
                              className="w-full pl-4 pr-10 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 appearance-none text-sm font-medium text-gray-900 dark:text-white"
                            >
                              {['Processing', 'Shipped', 'Delivered', 'Cancelled'].map((s) => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                            </div>
                          </div>
                        </div>

                        {status === 'Shipped' && (
                          <div className="space-y-3 pt-2 animate-in slide-in-from-top-2 duration-200">
                             <div className="relative">
                               <input
                                 type="text"
                                 placeholder="Tracking Number"
                                 value={trackingNumber}
                                 onChange={(e) => setTrackingNumber(e.target.value)}
                                 className="w-full pl-4 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                               />
                             </div>
                             <div className="relative">
                               <input
                                 type="text"
                                 placeholder="Carrier (e.g. FedEx)"
                                 value={carrier}
                                 onChange={(e) => setCarrier(e.target.value)}
                                 className="w-full pl-4 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                               />
                             </div>
                          </div>
                        )}

                        <button
                          onClick={handleUpdateStatus}
                          disabled={loading || status === order.orderStatus}
                          className={`w-full py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm font-bold transition-all shadow-lg ${
                            loading || status === order.orderStatus
                              ? 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500 cursor-not-allowed shadow-none'
                              : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-blue-500/25 active:scale-95'
                          }`}
                        >
                          {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          ) : (
                            <>
                              Update Status
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Payment Info */}
                    <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-green-500" />
                        Payment
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500 dark:text-gray-400">Method</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">{order.paymentMethod}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500 dark:text-gray-400">Status</span>
                          <span className={`px-2 py-0.5 text-xs font-bold rounded uppercase ${
                            order.isPaid 
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          }`}>
                            {order.isPaid ? 'Paid' : 'Unpaid'}
                          </span>
                        </div>
                        
                        {!order.isPaid && (
                          <button
                            onClick={() => {
                              setPendingAction(() => async () => {
                                try {
                                  setLoading(true);
                                  await adminService.markOrderAsPaid(order._id, {
                                    id: 'MANUAL_ADMIN',
                                    status: 'COMPLETED',
                                    update_time: new Date().toISOString(),
                                    payer: { email_address: 'admin@manual.com' }
                                  });
                                  toast.success('Order marked as paid & payouts processed');
                                  onUpdate();
                                  onClose();
                                } catch (err) {
                                  toast.error('Failed to mark as paid');
                                  console.error(err);
                                } finally {
                                  setLoading(false);
                                  setIsConfirmModalOpen(false);
                                }
                              });
                              setIsConfirmModalOpen(true);
                            }}
                            className="w-full mt-2 py-2 px-3 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded transition-colors"
                          >
                            Mark as Paid (Manual)
                          </button>
                        )}
                        {order.isPaid && order.paidAt && (
                           <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-500 dark:text-gray-400">Paid On</span>
                              <span className="text-xs font-medium text-gray-900 dark:text-white">
                                {new Date(order.paidAt).toLocaleDateString()}
                              </span>
                           </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
    
    <ConfirmationModal
      isOpen={isConfirmModalOpen}
      onClose={() => setIsConfirmModalOpen(false)}
      onConfirm={() => {
        if (pendingAction) pendingAction();
      }}
      title="Confirm Manual Payment"
      message="Are you sure you want to mark this order as PAID manually? This will immediately trigger vendor payouts and update their wallet balances. This action is irreversible."
      confirmText="Yes, Mark as Paid"
      variant="warning"
    />
    </>
  );
};

export default OrderDetailsModal;
