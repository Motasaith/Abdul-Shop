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
import { 
  HeartIcon, 
  ShoppingCartIcon, 
  TrashIcon,
  StarIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';

const WishlistPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  const wishlistItems = useAppSelector(selectWishlistItems);
  
  // Debug: Log wishlist items to see structure
  React.useEffect(() => {
    if (wishlistItems.length > 0) {
      // Wishlist items loaded
    }
  }, [wishlistItems]);
  const loading = useAppSelector(selectWishlistLoading);
  const error = useAppSelector(selectWishlistError);
  const itemCount = useAppSelector(selectWishlistItemCount);
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    // Force refresh wishlist to get updated product data
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
      <StarIcon
        key={index}
        className={`h-4 w-4 ${
          index < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading && wishlistItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  if (itemCount === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-gray-100 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
            <HeartIcon className="h-12 w-12 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Wishlist is Empty</h2>
          <p className="text-gray-600 mb-8">
            Save items you love by clicking the heart icon on any product. 
            They'll appear here for easy access later.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors"
          >
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <HeartIconSolid className="h-8 w-8 text-red-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              My Wishlist ({itemCount} {itemCount === 1 ? 'item' : 'items'})
            </h1>
          </div>
          {itemCount > 0 && (
            <button
              onClick={handleClearWishlist}
              className="text-red-600 hover:text-red-700 font-medium text-sm flex items-center"
            >
              <TrashIcon className="h-4 w-4 mr-1" />
              Clear All
            </button>
          )}
        </div>

        {/* Wishlist Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistItems.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow group"
            >
              {/* Product Image */}
              <div className="relative aspect-square overflow-hidden">
                <img
                  src={(item.product.images && item.product.images[0]?.url) || 'https://via.placeholder.com/300x300?text=No+Image'}
                  alt={item.product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/300x300?text=No+Image';
                  }}
                />
                
                {/* Overlay buttons */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex space-x-2">
                    <Link
                      to={`/products/${item.product._id}`}
                      className="bg-white p-2 rounded-full shadow-md hover:bg-gray-50 transition-colors"
                      title="View Product"
                    >
                      <EyeIcon className="h-5 w-5 text-gray-700" />
                    </Link>
                    <button
                      onClick={() => handleRemoveItem(item.product._id)}
                      className="bg-white p-2 rounded-full shadow-md hover:bg-red-50 transition-colors"
                      title="Remove from Wishlist"
                    >
                      <TrashIcon className="h-5 w-5 text-red-600" />
                    </button>
                  </div>
                </div>

                {/* Stock badge */}
                {item.product.countInStock === 0 && (
                  <div className="absolute top-3 left-3 bg-red-600 text-white px-2 py-1 rounded-md text-xs font-medium">
                    Out of Stock
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-4">
                <div className="mb-2">
                  <Link
                    to={`/products/${item.product._id}`}
                    className="text-lg font-medium text-gray-900 hover:text-red-600 transition-colors line-clamp-2"
                  >
                    {item.product.name}
                  </Link>
                </div>

                <div className="mb-2">
                  <span className="text-sm text-gray-500">{item.product.brand}</span>
                </div>

                {/* Rating */}
                <div className="flex items-center space-x-1 mb-3">
                  <div className="flex">
                    {renderStars(item.product.rating)}
                  </div>
                  <span className="text-sm text-gray-500">
                    ({item.product.numReviews})
                  </span>
                </div>

                {/* Price */}
                <div className="mb-4">
                  <span className="text-xl font-bold text-red-600">
                    Rs. {item.product.price}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <button
                    onClick={() => handleAddToCart(item)}
                    disabled={item.product.countInStock === 0}
                    className={`w-full flex items-center justify-center px-4 py-2 rounded-md font-medium transition-colors ${
                      item.product.countInStock === 0
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-red-600 text-white hover:bg-red-700'
                    }`}
                  >
                    <ShoppingCartIcon className="h-4 w-4 mr-2" />
                    {item.product.countInStock === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </button>

                  <button
                    onClick={() => handleRemoveItem(item.product._id)}
                    className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <HeartIcon className="h-4 w-4 mr-2" />
                    Remove
                  </button>
                </div>

                {/* Added date */}
                <div className="mt-3 text-xs text-gray-500">
                  Added {new Date(item.addedAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Continue Shopping */}
        <div className="mt-12 text-center">
          <Link
            to="/products"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default WishlistPage;
