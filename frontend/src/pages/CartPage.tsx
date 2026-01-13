import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { removeFromCart, updateQuantity, clearCart } from '../store/slices/cartSlice';
import { useTranslation } from '../hooks/useTranslation';
import {
  ShoppingCartIcon,
  TrashIcon,
  PlusIcon,
  MinusIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import WishlistButton from '../components/common/WishlistButton';
import toast from 'react-hot-toast';
import { usePrice } from '../hooks/usePrice';

const CartPage: React.FC = () => {
  const { formatPrice } = usePrice();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { items, totalItems, totalPrice } = useAppSelector((state) => state.cart);
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const handleQuantityUpdate = async (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setIsUpdating(productId);
    try {
      dispatch(updateQuantity({ productId: productId, quantity: newQuantity }));
      setTimeout(() => setIsUpdating(null), 300);
    } catch (error) {
      toast.error('Failed to update quantity');
      setIsUpdating(null);
    }
  };

  const handleRemoveItem = (productId: string) => {
    dispatch(removeFromCart(productId));
    toast.success('Item removed from cart');
  };

  const handleClearCart = () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      dispatch(clearCart());
      toast.success('Cart cleared');
    }
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      toast.error('Please login to proceed to checkout');
      navigate('/login');
      return;
    }
    navigate('/checkout');
  };

  // Convert threshold (Rs. 999) and fee (Rs. 135) to current currency if needed
  // For simplicity, we'll keep the logic but the display will be formatted
  const deliveryFee = totalPrice > 999 ? 0 : 135; 
  const totalWithDelivery = totalPrice + deliveryFee;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <ShoppingCartIcon className="mx-auto h-24 w-24 text-gray-400 dark:text-gray-600" />
            <h2 className="mt-4 text-3xl font-bold text-gray-900 dark:text-white">{t('cart.emptyTitle')}</h2>
            <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
              {t('cart.emptySubtitle')}
            </p>
            <div className="mt-8">
              <Link
                to="/products"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-orange-500 hover:bg-orange-600 transition-colors"
              >
                <ArrowLeftIcon className="mr-2 h-5 w-5" />
                {t('cart.continueShopping')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t('cart.title')} ({totalItems} {totalItems === 1 ? t('cart.item') : t('cart.items')})
          </h1>
          <button
            onClick={handleClearCart}
            className="text-red-600 hover:text-red-700 font-medium text-sm flex items-center"
          >
            <TrashIcon className="h-4 w-4 mr-1" />
            {t('cart.clearCart')}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-colors duration-300">
              <div className="p-6">
                <div className="space-y-6">
                  {items.map((item) => (
                    <div key={item.product} className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow">
                      {/* Product Image */}
                      <div className="flex-shrink-0 w-full sm:w-auto">
                        <img
                          src={item.image || 'https://via.placeholder.com/120x120?text=No+Image'}
                          alt={item.name}
                          className="w-full h-48 sm:w-24 sm:h-24 object-cover rounded-lg"
                          onError={(e) => {
                            e.currentTarget.src = 'https://via.placeholder.com/120x120?text=No+Image';
                          }}
                        />
                      </div>

                      {/* Product Info */}
                      <div className="flex-grow w-full">
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                          <div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white hover:text-orange-600 dark:hover:text-orange-400">
                              <Link to={`/products/${item.product}`}>
                                {item.name}
                              </Link>
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                              {item.countInStock > 0 ? (
                                <span className="text-green-600">{t('cart.inStock')}</span>
                              ) : (
                                <span className="text-red-600">{t('cart.outOfStock')}</span>
                              )}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-gray-900 dark:text-white">
                              {formatPrice(item.price)}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {formatPrice(item.price * item.quantity)} total
                            </p>
                          </div>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex flex-wrap items-center justify-between mt-4 w-full gap-y-3">
                          <div className="flex items-center space-x-3">
                              <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
                                <button
                                  onClick={() => handleQuantityUpdate(item.product, item.quantity - 1)}
                                  disabled={item.quantity <= 1 || isUpdating === item.product}
                                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 dark:text-gray-300"
                                >
                                  <MinusIcon className="h-4 w-4" />
                                </button>
                                <span className="px-3 py-2 font-medium text-gray-900 dark:text-white min-w-[2rem] text-center">
                                  {isUpdating === item.product ? '...' : item.quantity}
                                </span>
                                <button
                                  onClick={() => handleQuantityUpdate(item.product, item.quantity + 1)}
                                  disabled={item.quantity >= item.countInStock || isUpdating === item.product}
                                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 dark:text-gray-300"
                                >
                                  <PlusIcon className="h-4 w-4" />
                                </button>
                              </div>
                              <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                {item.countInStock} {t('cart.available')}
                              </span>
                            </div>

                          <div className="flex items-center space-x-2">
                            <WishlistButton 
                              productId={item.product}
                              className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                              size="md"
                            />
                            <button
                              onClick={() => handleRemoveItem(item.product)}
                              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                              title="Remove from cart"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Continue Shopping */}
            <div className="mt-6">
              <Link
                to="/products"
                className="inline-flex items-center text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 font-medium"
              >
                <ArrowLeftIcon className="mr-2 h-5 w-5" />
                {t('cart.continueShopping')}
              </Link>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 sticky top-6 transition-colors duration-300">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">{t('cart.orderSummary')}</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">{t('cart.subtotal')} ({totalItems} {t('cart.items')})</span>
                  <span className="font-medium text-gray-900 dark:text-white">{formatPrice(totalPrice)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">{t('cart.deliveryFee')}</span>
                  <span className={`font-medium ${deliveryFee === 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}>
                    {deliveryFee === 0 ? t('cart.free') : formatPrice(deliveryFee)}
                  </span>
                </div>
                
                {deliveryFee > 0 && (
                  <div className="text-sm text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg border border-orange-100 dark:border-orange-800/30">
                    {t('cart.addMoreForFree', { amount: formatPrice(1000 - totalPrice) })}
                  </div>
                )}
                
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="flex justify-between text-lg font-semibold">
                    <span className="text-gray-900 dark:text-white">{t('cart.total')}</span>
                    <span className="text-orange-600 dark:text-orange-400">{formatPrice(totalWithDelivery)}</span>
                  </div>
                </div>

                <div className="space-y-3 pt-4">
                  <button
                    onClick={handleCheckout}
                    className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
                  >
                    {t('cart.proceedToCheckout')}
                  </button>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
                      </svg>
                      <span>{t('cart.secureCheckout')}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">{t('cart.weAccept')}</h3>
                <div className="flex space-x-2">
                  <div className="bg-gray-100 dark:bg-gray-700 rounded p-2 text-xs font-medium text-gray-600 dark:text-gray-300">
                    {t('cart.cod')}
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-700 rounded p-2 text-xs font-medium text-gray-600 dark:text-gray-300">
                    {t('cart.card')}
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

export default CartPage;
