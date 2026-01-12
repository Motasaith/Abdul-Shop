import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { clearCart } from '../store/slices/cartSlice';
import { createOrder } from '../store/slices/orderSlice';
import toast from 'react-hot-toast';
import { usePrice } from '../hooks/usePrice';
import {
  TruckIcon,
  ShieldCheckIcon,
  CreditCardIcon,
  MapPinIcon,
  PhoneIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { apiService } from '../services/api';

interface PaymentMethod {
  id: string;
  name: string;
  details?: any;
}

interface CheckoutFormData {
  fullName: string;
  address: string;
  city: string;
  postalCode: string;
  phone: string;
  paymentMethod: string;
}

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { items, totalItems, totalPrice } = useAppSelector((state) => state.cart);
  const { user } = useAppSelector((state) => state.auth);
  const { formatPrice } = usePrice();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CheckoutFormData>({
    fullName: user?.name || '',
    address: '',
    city: '',
    postalCode: '',
    phone: '',
    paymentMethod: 'cod'
  });
  const [errors, setErrors] = useState<Partial<CheckoutFormData>>({});
  const [availableMethods, setAvailableMethods] = useState<PaymentMethod[]>([]);

  React.useEffect(() => {
    const fetchMethods = async () => {
      try {
        const response = await apiService.get<PaymentMethod[]>('/payments/methods');
        const methods = response.data;
        setAvailableMethods(methods);
        // Set default method if current is not available or empty
        if (methods.length > 0 && !methods.find((m: any) => m.id === formData.paymentMethod)) {
            setFormData(prev => ({ ...prev, paymentMethod: methods[0].id }));
        }
      } catch (error) {
        console.error('Failed to fetch payment methods');
        // Fallback or leave empty? Better to have at least COD if fail?
        // Let's assume backend always returns something or empty array
      }
    };
    fetchMethods();
  }, []);

  const location = useLocation();
  const buyNowItem = location.state?.buyNowItem;
  
  // Use buyNowItem if available, otherwise use cart items
  const checkoutItems = buyNowItem ? [buyNowItem] : items;
  
  // Calculate totals based on checkoutItems
  const checkoutTotalItems = buyNowItem ? buyNowItem.quantity : totalItems;
  const checkoutTotalPrice = buyNowItem ? buyNowItem.price * buyNowItem.quantity : totalPrice;
  
  const deliveryFee = checkoutTotalPrice > 999 ? 0 : 135;
  const totalWithDelivery = checkoutTotalPrice + deliveryFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('You must be logged in to place an order.');
      navigate('/login');
      return;
    }

    // Validate form
    const newErrors: Partial<CheckoutFormData> = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required.';
    if (!formData.address.trim()) newErrors.address = 'Address is required.';
    if (!formData.city.trim()) newErrors.city = 'City is required.';
    if (!formData.postalCode.trim()) newErrors.postalCode = 'Postal code is required.';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required.';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      // Transform frontend form data to match backend Address schema
      const transformedShippingAddress = {
        address: formData.address, // Backend expects 'address', not 'street'
        city: formData.city,
        postalCode: formData.postalCode, // Backend expects 'postalCode', not 'zipCode'
        country: 'Pakistan', // Required field in backend
        // Optional fields that backend may accept
        name: formData.fullName,
        phone: formData.phone
      };

      // Map frontend payment method values to backend enum values
      const backendPaymentMethod = formData.paymentMethod === 'cod' 
        ? 'Cash on Delivery' 
        : 'Credit Card';

      const result = await dispatch(createOrder({
        orderItems: checkoutItems,
        user: user.id,
        shippingAddress: transformedShippingAddress,
        paymentMethod: backendPaymentMethod,
        itemsPrice: checkoutTotalPrice,
        shippingPrice: deliveryFee,
        totalPrice: totalWithDelivery,
        isPaid: false,
        isDelivered: false
      })).unwrap();
      
      // Only clear cart if we're not in "Buy Now" mode
      if (!buyNowItem) {
        dispatch(clearCart());
      }
      toast.success('Order placed successfully!');
      navigate(`/orders/${result._id}`);
    } catch (error) {
      toast.error('Failed to place order!');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear error when user starts typing
    if (errors[name as keyof CheckoutFormData]) {
      setErrors({ ...errors, [name]: undefined });
    }
  };

  if (checkoutItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center transition-colors duration-300">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Your cart is empty</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">Add some items to your cart before checking out.</p>
          <button
            onClick={() => navigate('/products')}
            className="bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Checkout</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Final step before you get your order!</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors duration-300">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Shipping Information</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Full Name *
                    </label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <UserIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                      </div>
                      <input
                        type="text"
                        name="fullName"
                        onChange={handleInputChange}
                        value={formData.fullName}
                        className={`block w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 ${
                          errors.fullName ? 'border-red-300 dark:border-red-700' : 'border-gray-300 dark:border-gray-600'
                        }`}
                        placeholder="John Doe"
                      />
                    </div>
                    {errors.fullName && (
                      <p className="mt-2 text-sm text-red-600">{errors.fullName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Phone Number *
                    </label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <PhoneIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                      </div>
                      <input
                        type="text"
                        name="phone"
                        onChange={handleInputChange}
                        value={formData.phone}
                        className={`block w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 ${
                          errors.phone ? 'border-red-300 dark:border-red-700' : 'border-gray-300 dark:border-gray-600'
                        }`}
                        placeholder="03xx-xxxxxxx"
                      />
                    </div>
                    {errors.phone && (
                      <p className="mt-2 text-sm text-red-600">{errors.phone}</p>
                    )}
                  </div>

                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Address *
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPinIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                    </div>
                    <input
                      type="text"
                      name="address"
                      onChange={handleInputChange}
                      value={formData.address}
                      className={`block w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 ${
                        errors.address ? 'border-red-300 dark:border-red-700' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="1234 Main St, Apartment, studio, or floor"
                    />
                  </div>
                  {errors.address && (
                    <p className="mt-2 text-sm text-red-600">{errors.address}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      onChange={handleInputChange}
                      value={formData.city}
                      className={`block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 ${
                        errors.city ? 'border-red-300 dark:border-red-700' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="Karachi"
                    />
                    {errors.city && (
                      <p className="mt-2 text-sm text-red-600">{errors.city}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Postal Code *
                    </label>
                    <input
                      type="text"
                      name="postalCode"
                      onChange={handleInputChange}
                      value={formData.postalCode}
                      className={`block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 ${
                        errors.postalCode ? 'border-red-300 dark:border-red-700' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="12345"
                    />
                    {errors.postalCode && (
                      <p className="mt-2 text-sm text-red-600">{errors.postalCode}</p>
                    )}
                  </div>

                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Payment Method
                  </label>
                  <select
                    name="paymentMethod"
                    onChange={handleInputChange}
                    value={formData.paymentMethod}
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {availableMethods.map((method) => (
                      <option key={method.id} value={method.id}>
                        {method.name}
                      </option>
                    ))}
                    {availableMethods.length === 0 && <option disabled>Loading methods...</option>}
                  </select>
                  
                  {/* Show Bank Details if selected */}
                  {formData.paymentMethod === 'bank' && (
                    <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-md text-sm text-blue-800 dark:text-blue-200">
                       {availableMethods.find(m => m.id === 'bank')?.details && (
                         <>
                            <p className="font-semibold">Bank Instructions:</p>
                            <div className="mt-2 space-y-1">
                               <p><span className="font-medium">Bank Name:</span> {availableMethods.find(m => m.id === 'bank')?.details.bankName}</p>
                               <p><span className="font-medium">Account Name:</span> {availableMethods.find(m => m.id === 'bank')?.details.accountName}</p>
                               <p><span className="font-medium">Account No:</span> {availableMethods.find(m => m.id === 'bank')?.details.accountNumber}</p>
                               <p className="mt-2">{availableMethods.find(m => m.id === 'bank')?.details.instructions}</p>
                            </div>
                         </>
                       )}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Processing...' : 'Place Order'}
                </button>
              </form>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 sticky top-6 transition-colors duration-300">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Order Summary</h2>
              
              <div className="space-y-4">
                {checkoutItems.map((item: any) => (
                  <div key={item.product} className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <img
                        src={item.image || 'https://via.placeholder.com/64x64?text=No+Image'}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.name}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Quantity: {item.quantity}</p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                ))}
                
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Subtotal ({checkoutTotalItems} items)</span>
                    <span className="text-sm font-medium dark:text-white">{formatPrice(checkoutTotalPrice)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Delivery Fee</span>
                    <span className={`text-sm font-medium ${deliveryFee === 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}>
                      {deliveryFee === 0 ? 'FREE' : formatPrice(deliveryFee)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-base font-semibold">
                    <span className="text-gray-900 dark:text-white">Total</span>
                    <span className="text-orange-600 dark:text-orange-500">{formatPrice(totalWithDelivery)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
