import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Star, Heart, Plus } from 'lucide-react';
import { usePrice } from '../../hooks/usePrice';
import { Product } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { toggleWishlistItem, selectIsInWishlist } from '../../store/slices/wishlistSlice';
import { toast } from 'react-hot-toast';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  showNewBadge?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, showNewBadge }) => {
  const { formatPrice } = usePrice();
  const [currentImage, setCurrentImage] = useState(product.images?.[0]?.url || 'https://via.placeholder.com/400x400?text=No+Image');
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const isInWishlist = useAppSelector(selectIsInWishlist(product._id));

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast.error('Please login to add items to wishlist');
      return;
    }

    dispatch(toggleWishlistItem(product._id)).unwrap()
      .then((res: any) => {
        const isAdded = res.wishlist.items.some((item: any) => item.product._id === product._id);
        toast.success(isAdded ? 'Added to wishlist' : 'Removed from wishlist');
      })
      .catch((err) => {
        toast.error('Failed to update wishlist');
      });
  };

  // Discount Calculation
  const hasDiscount = product.comparePrice && product.comparePrice > product.price;
  const discountPercentage = hasDiscount 
    ? Math.round(((product.comparePrice! - product.price) / product.comparePrice!) * 100) 
    : 0;

  // Use up to 4 images for the preview row, ensuring we have at least the main image
  const previewImages = product.images?.slice(0, 4) || [];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative bg-white dark:bg-[#1A1A1A] rounded-[20px] p-4 flex flex-col justify-between hover:shadow-2xl transition-all duration-500 border border-transparent dark:border-gray-800 hover:border-gray-100 dark:hover:border-gray-700 h-full"
    >
        {/* Top Section: Wishlist & Badge */}
        <div className="flex justify-between items-start mb-4 relative z-10">
           <div className="flex gap-2">
              {(showNewBadge || product.isNewArrival) && (
                <span className="bg-black dark:bg-white text-white dark:text-black text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  New
                </span>
              )}
              {hasDiscount && (
                <span className="bg-orange-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  {discountPercentage}% OFF
                </span>
              )}
           </div>
           
           <button 
             className={`transition-colors ${isInWishlist ? 'text-red-500 hover:text-red-600' : 'text-gray-400 hover:text-red-500'}`}
             title={isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
             onClick={handleWishlist}
           >
             <Heart className={`w-5 h-5 ${isInWishlist ? 'fill-current' : ''}`} />
           </button>
        </div>

        {/* Main Image Area */}
        <div className="relative aspect-square mb-4 flex items-center justify-center overflow-hidden rounded-xl bg-gray-50 dark:bg-gray-800">
            <Link to={`/products/${product._id}`} className="w-full h-full flex items-center justify-center">
              <motion.img
                key={currentImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                src={currentImage}
                alt={product.name}
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/400x400?text=No+Image';
                }}
              />
            </Link>
        </div>

        {/* Thumbnails Row */}
        {previewImages.length > 1 && (
            <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar pb-1">
                {previewImages.map((img, idx) => (
                    <button
                        key={idx}
                        onClick={(e) => {
                            e.preventDefault();
                            setCurrentImage(img.url);
                        }}
                        className={`w-12 h-12 rounded-lg flex-shrink-0 border p-0.5 bg-gray-50 dark:bg-gray-800 flex items-center justify-center overflow-hidden transition-all ${
                            currentImage === img.url 
                            ? 'border-black dark:border-white opacity-100 ring-1 ring-black dark:ring-white' 
                            : 'border-transparent opacity-60 hover:opacity-100 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                    >
                        <img src={img.url} alt="" className="w-full h-full object-cover rounded-md" />
                    </button>
                ))}
            </div>
        )}

        {/* Product Info */}
        <div className="mt-auto">
            <div className="text-xs font-bold text-orange-500 mb-1 uppercase tracking-wide">
                {product.brand || 'Collection'}
            </div>
            
            <Link to={`/products/${product._id}`}>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                    {product.name}
                </h3>
            </Link>

            <div className="flex items-center justify-between mt-4">
                <div className="flex flex-col">
                   {hasDiscount && (
                      <span className="text-xs text-gray-400 line-through font-medium mb-0.5">
                        {formatPrice(product.comparePrice!)}
                      </span>
                   )}
                   <span className="text-xl font-bold text-gray-900 dark:text-white">
                      {formatPrice(product.price)}
                   </span>
                </div>

                {onAddToCart && (
                    <button
                        onClick={(e) => {
                          e.preventDefault();
                          if (product.countInStock > 0) onAddToCart(product);
                        }}
                        disabled={product.countInStock === 0}
                        className={`h-10 px-4 rounded-xl flex items-center justify-center gap-2 font-bold text-sm transition-all shadow-sm ${
                            product.countInStock > 0
                            ? 'bg-[#111111] dark:bg-white text-white dark:text-black hover:bg-black hover:scale-105 active:scale-95'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                    >
                        {product.countInStock > 0 ? (
                            <>
                              <span className="hidden sm:inline">Add</span>
                              <Plus className="w-5 h-5 sm:hidden" />
                              <ShoppingBag className="w-4 h-4 hidden sm:block" />
                            </>
                         ) : (
                            'Sold'
                         )}
                    </button>
                )}
            </div>
        </div>
    </motion.div>
  );
};

export default ProductCard;
