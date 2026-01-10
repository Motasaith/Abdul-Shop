import React, { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchProducts } from '../store/slices/productSlice';
import { addToCart } from '../store/slices/cartSlice';
import { 
  StarIcon, 
  ShoppingCartIcon,
  TagIcon,
  FireIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { usePrice } from '../hooks/usePrice';
import { useTranslation } from '../hooks/useTranslation';
import ProductCard from '../components/common/ProductCard';

const SalesPage: React.FC = () => {
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
        onSale: true,
        sort: 'price-asc' // Usually people want cheap deals first, or maybe newest deals? using default backend sort if omitted, but 'price-low' might be better. Let's stick to default for now or 'newest'
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

  const calculateDiscount = (price: number, comparePrice?: number) => {
    if (!comparePrice || comparePrice <= price) return 0;
    return Math.round(((comparePrice - price) / comparePrice) * 100);
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-red-600 to-pink-600 text-white py-12 mb-8 relative overflow-hidden">
        {/* Decorative Circles */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-white opacity-10"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-40 h-40 rounded-full bg-yellow-300 opacity-20"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div>
              <h1 className="text-5xl font-extrabold mb-4 flex items-center">
                <FireIcon className="h-12 w-12 mr-3 text-yellow-300 animate-bounce" />
                {t('salesPage.title', { defaultValue: "Today's Deals" })}
              </h1>
              <p className="text-red-100 text-2xl font-light">
                {t('salesPage.subtitle', { defaultValue: 'Huge Savings on Top Brands!' })}
              </p>
              <div className="mt-6 inline-block bg-yellow-400 text-red-800 px-6 py-2 rounded-full font-bold text-lg shadow-lg transform rotate-2 hover:rotate-0 transition-transform">
                {t('salesPage.offerText', { defaultValue: 'Up to 40% OFF Selected Items' })}
              </div>
            </div>
            <div className="hidden md:block">
               {/* Optional: Add an image or graphic for sales */}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading deals...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <TagIcon className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-4 text-lg">No active deals right now. Check back later!</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {products.map((product) => (
                <ProductCard 
                  key={product._id} 
                  product={product} 
                  onAddToCart={() => handleAddToCart(product)}
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
                      ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600'
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
                        ? 'bg-red-600 text-white'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600'
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
                      ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600'
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

export default SalesPage;
