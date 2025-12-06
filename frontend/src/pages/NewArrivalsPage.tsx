import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchProducts } from '../store/slices/productSlice';
import { addToCart } from '../store/slices/cartSlice';
import { 
  StarIcon, 
  ShoppingCartIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { usePrice } from '../hooks/usePrice';
import { useTranslation } from '../hooks/useTranslation';
import ProductCard from '../components/common/ProductCard';

const NewArrivalsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const { formatPrice } = usePrice();
  const { products, loading, totalPages, currentPage } = useAppSelector((state) => state.products);
  const [searchParams, setSearchParams] = useSearchParams();
  
  const currentPage_ = parseInt(searchParams.get('page') || '1');
  
  useEffect(() => {
    const params = {
      page: currentPage_,
      limit: 12,
      filters: {
        sort: 'newest',
        newArrivals: true
      }
    };
    
    dispatch(fetchProducts(params));
  }, [dispatch, currentPage_]);

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    setSearchParams(params);
    window.scrollTo(0, 0);
  };
  
  const handleAddToCart = (product: any) => {
    dispatch(addToCart({
      product: product._id,
      name: product.name,
      price: product.price,
      image: product.images[0]?.url || '',
      quantity: 1,
      countInStock: product.countInStock
    }));
  };
  
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          i < Math.floor(rating) ? (
            <StarIconSolid key={i} className="h-4 w-4 text-yellow-400" />
          ) : (
            <StarIcon key={i} className="h-4 w-4 text-gray-300" />
          )
        ))}
      </div>
    );
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white py-12 mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2 flex items-center">
                <SparklesIcon className="h-10 w-10 mr-3 animate-pulse" />
                {t('newArrivalsPage.title', { defaultValue: 'New Arrivals' })}
              </h1>
              <p className="text-teal-100 text-lg">
                {t('newArrivalsPage.subtitle', { defaultValue: 'Check out the latest additions to our collection.' })}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading new arrivals...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">No new products found.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {products.map((product) => (
                <ProductCard 
                  key={product._id} 
                  product={product} 
                  onAddToCart={() => handleAddToCart(product)}
                  showNewBadge={true}
                />
              ))}
            </div>
            
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-2 rounded-md text-sm ${
                    currentPage === 1
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                  }`}
                >
                  Previous
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => handlePageChange(i + 1)}
                    className={`px-3 py-2 rounded-md text-sm ${
                      (i + 1) === currentPage
                        ? 'bg-teal-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-2 rounded-md text-sm ${
                    currentPage === totalPages
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                  }`}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default NewArrivalsPage;
