import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCartIcon, StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { usePrice } from '../../hooks/usePrice';
import { Product } from '../../types';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  showNewBadge?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, showNewBadge }) => {
  const { formatPrice } = usePrice();

  return (
    <div className="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 animate-fade-in">
      <Link to={`/products/${product._id}`} className="block relative overflow-hidden">
        <div className="aspect-w-1 aspect-h-1 bg-gray-200">
          <img
            src={product.images?.[0]?.url || 'https://via.placeholder.com/300x300?text=No+Image'}
            alt={product.name}
            className="w-full h-48 object-cover transform transition-transform duration-500 group-hover:scale-110"
            onError={(e) => {
              e.currentTarget.src = 'https://via.placeholder.com/300x300?text=No+Image';
            }}
          />
        </div>
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {(showNewBadge || product.isNewArrival) && (
            <div className="bg-teal-500 text-white text-xs font-bold px-2 py-1 rounded shadow-sm animate-scale-in">
              NEW
            </div>
          )}
          {product.onSale && (
            <div className="bg-pink-500 text-white text-xs font-bold px-2 py-1 rounded shadow-sm animate-scale-in" style={{ animationDelay: '0.1s' }}>
              SALE
            </div>
          )}
          {/* Discount Badge */}
          {product.comparePrice && product.comparePrice > product.price && (
             <div className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded shadow-sm animate-scale-in" style={{ animationDelay: '0.2s' }}>
               -{Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)}%
             </div>
          )}
        </div>
      </Link>

      <div className="p-4">
        <Link to={`/products/${product._id}`}>
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
            {product.name}
          </h3>
        </Link>
        
        <div className="flex items-center mb-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              i < Math.floor(product.rating) ? (
                <StarIconSolid key={i} className="h-4 w-4 text-yellow-400" />
              ) : (
                <StarIcon key={i} className="h-4 w-4 text-gray-300" />
              )
            ))}
          </div>
          <span className="text-sm text-gray-600 ml-2">({product.numReviews})</span>
        </div>

        <div className="flex items-center justify-between mt-3">
          <div className="flex flex-col">
             {product.comparePrice && product.comparePrice > product.price && (
               <span className="text-xs text-gray-500 line-through">
                 {formatPrice(product.comparePrice)}
               </span>
             )}
            <span className="text-lg font-bold text-gray-900">{formatPrice(product.price)}</span>
          </div>
          
          {onAddToCart && (
            <button
              onClick={() => onAddToCart(product)}
              disabled={product.countInStock === 0}
              className={`p-2 rounded-full transition-all duration-200 active:scale-95 ${
                product.countInStock > 0
                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              title="Add to Cart"
            >
              <ShoppingCartIcon className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
