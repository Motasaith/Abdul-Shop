import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { 
  fetchWishlist, 
  removeFromWishlist, 
  clearWishlist,
  selectWishlistItems,
  selectWishlistLoading,
  selectWishlistError,
  selectWishlistItemCount
} from '../store/slices/wishlistSlice';
import { addToCart } from '../store/slices/cartSlice';
import { usePrice } from '../hooks/usePrice';
import { 
  Heart, 
  ShoppingCart, 
  Trash,
  Star,
  Eye,
  ShoppingBag,
  AlertCircle
} from 'lucide-react';

const WishlistPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { formatPrice } = usePrice();
  
  const wishlistItems = useAppSelector(selectWishlistItems);
  const loading = useAppSelector(selectWishlistLoading);
  const error = useAppSelector(selectWishlistError);
  const itemCount = useAppSelector(selectWishlistItemCount);
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    dispatch(fetchWishlist());
  }, [dispatch, isAuthenticated, navigate]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleRemoveItem = async (productId: string) => {
    try {
      await dispatch(removeFromWishlist(productId)).unwrap();
      toast.success('Item removed from wishlist');
    } catch (error: any) {
      toast.error(error || 'Failed to remove item');
    }
  };

  const handleClearWishlist = async () => {
    if (window.confirm('Are you sure you want to clear your entire wishlist?')) {
      try {
        await dispatch(clearWishlist()).unwrap();
        toast.success('Wishlist cleared successfully');
      } catch (error: any) {
        toast.error(error || 'Failed to clear wishlist');
      }
    }
  };

  const handleAddToCart = async (item: any) => {
    if (item.product.countInStock === 0) {
      toast.error('Product is out of stock');
      return;
    }

    try {
      dispatch(addToCart({
        product: item.product._id,
        name: item.product.name,
        image: (item.product.images && item.product.images[0]?.url) || '',
        price: item.product.price,
        countInStock: item.product.countInStock,
        quantity: 1
      }));
      toast.success('Added to cart successfully');
    } catch (error: any) {
      toast.error('Failed to add to cart');
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${
          index < Math.floor(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600'
        }`}
      />
    ));
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading && wishlistItems.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 dark:border-red-500"></div>
      </div>
    );
  }

  if (itemCount === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center transition-colors duration-300">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-white dark:bg-gray-800 rounded-full p-8 w-32 h-32 mx-auto mb-6 flex items-center justify-center shadow-sm border border-gray-100 dark:border-gray-700/50">
            <Heart className="h-16 w-16 text-gray-400 dark:text-gray-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Your Wishlist is Empty</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-sm mx-auto">
            Save items you love by clicking the heart icon on any product. 
            They'll appear here for easy access later.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center px-8 py-3.5 border border-transparent text-base font-bold rounded-xl text-white bg-red-600 hover:bg-red-700 transition-colors shadow-lg shadow-red-500/20"
          >
            Start Shopping
            <ShoppingBag className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-10 gap-4">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-2xl">
               <Heart className="h-8 w-8 text-red-600 dark:text-red-400 fill-current" />
            </div>
            <div>
               <h1 className="text-3xl font-bold text-gray-900 dark:text-white">my Wishlist</h1>
               <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
                  {itemCount} {itemCount === 1 ? 'item' : 'items'} saved for later
               </p>
            </div>
          </div>
          {itemCount > 0 && (
            <button
              onClick={handleClearWishlist}
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium text-sm rounded-xl flex items-center transition-colors shadow-sm"
            >
              <Trash className="h-4 w-4 mr-2" />
              Clear All
            </button>
          )}
        </div>

        {/* Wishlist Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistItems.map((item) => (
            <div
              key={item._id}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 dark:border-gray-700/50 overflow-hidden transition-all duration-300 group flex flex-col h-full"
            >
              {/* Product Image */}
              <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-800">
                <img
                  src={(item.product.images && item.product.images[0]?.url) || 'https://via.placeholder.com/300x300?text=No+Image'}
                  alt={item.product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/300x300?text=No+Image';
                  }}
                />
                
                {/* Overlay actions */}
                <div className="absolute top-3 right-3 flex flex-col gap-2 translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                   <button
                      onClick={() => handleRemoveItem(item.product._id)}
                      className="bg-white dark:bg-gray-800 p-2.5 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 hover:bg-red-50 dark:hover:bg-red-900/30 text-gray-400 hover:text-red-500 transition-colors"
                      title="Remove from Wishlist"
                    >
                      <Trash className="w-5 h-5" />
                    </button>
                    <Link
                      to={`/products/${item.product._id}`}
                      className="bg-white dark:bg-gray-800 p-2.5 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-5 h-5" />
                    </Link>
                </div>

                {/* Stock badge */}
                {item.product.countInStock === 0 && (
                  <div className="absolute top-3 left-3 bg-red-500/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Out of Stock
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-5 flex flex-col flex-grow">
                <div className="mb-1">
                   <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                      {item.product.brand}
                   </span>
                </div>
                
                <Link
                  to={`/products/${item.product._id}`}
                  className="text-lg font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-2 mb-2"
                >
                  {item.product.name}
                </Link>

                {/* Rating */}
                <div className="flex items-center gap-1.5 mb-4">
                  <div className="flex">
                    {renderStars(item.product.rating)}
                  </div>
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 pt-0.5">
                    ({item.product.numReviews})
                  </span>
                </div>

                <div className="mt-auto">
                    {/* Price */}
                    <div className="mb-4 flex items-baseline gap-2">
                       <span className="text-xl font-bold text-gray-900 dark:text-white">
                          {formatPrice(item.product.price)}
                       </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-1 gap-2.5">
                      <button
                        onClick={() => handleAddToCart(item)}
                        disabled={item.product.countInStock === 0}
                        className={`w-full flex items-center justify-center px-4 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm ${
                          item.product.countInStock === 0
                            ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                            : 'bg-gray-900 dark:bg-white text-white dark:text-black hover:bg-black dark:hover:bg-gray-200 hover:scale-[1.02] active:scale-[0.98]'
                        }`}
                      >
                        <ShoppingBag className="h-4 w-4 mr-2" />
                        {item.product.countInStock === 0 ? 'Out of Stock' : 'Add to Cart'}
                      </button>
                    </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Continue Shopping */}
        <div className="mt-16 text-center">
          <Link
            to="/products"
            className="inline-flex items-center px-6 py-3 border border-gray-200 dark:border-gray-700 text-sm font-bold rounded-xl text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default WishlistPage;
