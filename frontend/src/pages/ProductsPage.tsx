import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchProducts } from '../store/slices/productSlice';
import { addToCart } from '../store/slices/cartSlice';
import { 
  StarIcon, 
  ShoppingCartIcon,
  FunnelIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

import { usePrice } from '../hooks/usePrice';

const ProductsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { formatPrice } = usePrice();
  const { products, loading, totalPages, currentPage, totalProducts } = useAppSelector((state) => state.products);
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  
  // Get current filters from URL
  const currentCategory = searchParams.get('category') || '';
  const currentSearch = searchParams.get('search') || '';
  const currentSort = searchParams.get('sort') || 'newest';
  const currentPage_ = parseInt(searchParams.get('page') || '1');
  const currentMinPrice = searchParams.get('minPrice') || '';
  const currentMaxPrice = searchParams.get('maxPrice') || '';
  const currentRating = searchParams.get('rating') || '';
  const currentVendor = searchParams.get('vendor') || '';
  
  // Local state for filters
  const [filters, setFilters] = useState({
    category: currentCategory,
    search: currentSearch,
    sort: currentSort,
    page: currentPage_,
    minPrice: currentMinPrice,
    maxPrice: currentMaxPrice,
    rating: currentRating,
    vendor: currentVendor
  });
  
  const categories = [
    'Electronics',
    'Clothing',
    'Books',
    'Home & Garden',
    'Sports',
    'Beauty',
    'Health',
    'Toys',
    'Automotive'
  ];
  
  const sortOptions = [
    { value: 'newest', label: 'Newest' },
    { value: 'oldest', label: 'Oldest' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'name', label: 'Name: A to Z' }
  ];
  
  useEffect(() => {
    const params = {
      page: currentPage_,
      limit: 12,
      filters: {
        category: currentCategory,
        search: currentSearch,
        sort: currentSort,
        minPrice: currentMinPrice ? parseFloat(currentMinPrice) : undefined,
        maxPrice: currentMaxPrice ? parseFloat(currentMaxPrice) : undefined,
        rating: currentRating ? parseInt(currentRating) : undefined,
        vendor: currentVendor || undefined
      }
    };
    
    dispatch(fetchProducts(params));
  }, [dispatch, currentCategory, currentSearch, currentSort, currentPage_, currentMinPrice, currentMaxPrice, currentRating, currentVendor]);

  // Sync local state with URL params
  useEffect(() => {
    setFilters({
      category: currentCategory,
      search: currentSearch,
      sort: currentSort,
      page: currentPage_,
      minPrice: currentMinPrice,
      maxPrice: currentMaxPrice,
      rating: currentRating,
      vendor: currentVendor
    });
  }, [currentCategory, currentSearch, currentSort, currentPage_, currentMinPrice, currentMaxPrice, currentRating, currentVendor]);
  
  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value, page: 1 };
    setFilters(newFilters);
    
    // Update URL params
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v && v !== '') {
        params.set(k, v.toString());
      }
    });
    setSearchParams(params);
  };
  
  const handlePageChange = (page: number) => {
    const newFilters = { ...filters, page };
    setFilters(newFilters);
    
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    setSearchParams(params);
  };
  
  const clearFilters = () => {
    setFilters({
      category: '',
      search: currentSearch, // Keep search term
      sort: 'newest',
      page: 1,
      minPrice: '',
      maxPrice: '',
      rating: '',
      vendor: ''
    });
    
    const params = new URLSearchParams();
    if (currentSearch) params.set('search', currentSearch);
    setSearchParams(params);
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
    <div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Products</h1>

            {currentSearch && (
              <p className="mt-2 text-gray-600 dark:text-gray-300">Search results for "{currentSearch}"</p>
            )}
            {currentCategory && (
              <p className="mt-2 text-gray-600 dark:text-gray-300">Category: {currentCategory}</p>
            )}
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{totalProducts} products found</p>
          </div>
          
          {/* Mobile filter toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden bg-white dark:bg-gray-800 p-2 rounded-md shadow-sm border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <FunnelIcon className="h-5 w-5 text-gray-600 dark:text-white" />
          </button>
        </div>
        
        <div className="lg:grid lg:grid-cols-4 lg:gap-8">
          {/* Filters Sidebar */}
          <div className={`lg:col-span-1 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6 lg:mb-0 transition-colors duration-300">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Filters</h2>
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Clear all
                </button>
              </div>
              
              {/* Category Filter */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Category</h3>
                <div className="space-y-2">
                  <label className="flex items-center text-gray-700 dark:text-gray-300">
                    <input
                      type="radio"
                      name="category"
                      value=""
                      checked={filters.category === ''}
                      onChange={(e) => handleFilterChange('category', e.target.value)}
                      className="mr-2"
                    />
                    <span className="text-sm">All Categories</span>
                  </label>
                  {categories.map((category) => (
                    <label key={category} className="flex items-center text-gray-700 dark:text-gray-300">
                      <input
                        type="radio"
                        name="category"
                        value={category}
                        checked={filters.category === category}
                        onChange={(e) => handleFilterChange('category', e.target.value)}
                        className="mr-2"
                      />
                      <span className="text-sm">{category}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              {/* Price Range */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Price Range</h3>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 dark:focus:ring-blue-400"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 dark:focus:ring-blue-400"
                  />
                </div>
              </div>
              
              {/* Rating Filter */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Rating</h3>
                <div className="space-y-2">
                  {[4, 3, 2, 1].map((rating) => (
                    <label key={rating} className="flex items-center text-gray-700 dark:text-gray-300">
                      <input
                        type="radio"
                        name="rating"
                        value={rating}
                        checked={filters.rating === rating.toString()}
                        onChange={(e) => handleFilterChange('rating', e.target.value)}
                        className="mr-2"
                      />
                      <div className="flex items-center">
                        {renderStars(rating)}
                        <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">& up</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              
              {/* Close button for mobile */}
              <button
                onClick={() => setShowFilters(false)}
                className="lg:hidden w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
          
          {/* Products Grid */}
          <div className="lg:col-span-3">
            {/* Sort and View Options */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium text-gray-900 dark:text-white">Sort by:</label>
                <select
                  value={filters.sort}
                  onChange={(e) => handleFilterChange('sort', e.target.value)}
                  className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 dark:focus:ring-blue-400"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Products Loading State */}
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading products...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-400 mb-4">No products found.</p>
                <button
                  onClick={clearFilters}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                {/* Products Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {products.map((product) => (
                    <div key={product._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                      <Link to={`/products/${product._id}`}>
                        <div className="aspect-w-1 aspect-h-1 bg-gray-200">
                          <img
                            src={product.images?.[0]?.url || '/api/placeholder/300/300'}
                            alt={product.name}
                            className="w-full h-48 object-cover"
                          />
                        </div>
                      </Link>
                      <div className="p-4">
                        <Link to={`/products/${product._id}`}>
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                            {product.name}
                          </h3>
                        </Link>
                        <div className="flex items-center mb-2">
                          {renderStars(product.rating)}
                          <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">({product.numReviews})</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg font-bold text-gray-900 dark:text-white">{formatPrice(product.price)}</span>
                            {product.comparePrice && (
                              <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                                {formatPrice(product.comparePrice)}
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => handleAddToCart(product)}
                            disabled={product.countInStock === 0}
                            className={`p-2 rounded-full transition-colors ${
                              product.countInStock > 0
                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                : 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                            }`}
                          >
                            <ShoppingCartIcon className="h-4 w-4" />
                          </button>
                        </div>
                        {product.countInStock === 0 && (
                          <p className="text-red-500 text-sm mt-2">Out of stock</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center space-x-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`px-3 py-2 rounded-md text-sm ${
                        currentPage === 1
                          ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                          : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      Previous
                    </button>
                    
                    {[...Array(totalPages)].map((_, i) => {
                      const page = i + 1;
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-2 rounded-md text-sm ${
                            page === currentPage
                              ? 'bg-blue-600 text-white'
                              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`px-3 py-2 rounded-md text-sm ${
                        currentPage === totalPages
                          ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
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
      </div>
    </div>
  );
};

export default ProductsPage;
