import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchProducts } from '../store/slices/productSlice';
import { addToCart } from '../store/slices/cartSlice';
// Service Imports
import newsletterService from '../services/newsletterService';
import { toast } from 'react-hot-toast';
import { 
  ArrowRightIcon, 
  StarIcon, 
  ShoppingCartIcon,
  TruckIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  PhoneIcon
} from '@heroicons/react/24/outline';

import { usePrice } from '../hooks/usePrice';
import { useTranslation } from '../hooks/useTranslation';
import ProductCard from '../components/common/ProductCard';

const HomePage: React.FC = () => {
  const { formatPrice } = usePrice();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { products, loading } = useAppSelector((state) => state.products);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterLoading, setNewsletterLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchProducts({ page: 1, limit: 8 }));
  }, [dispatch]);

  const handleNewsletterSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newsletterEmail) {
      toast.error('Please enter your email address');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newsletterEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setNewsletterLoading(true);
    
    try {
      const response = await newsletterService.subscribe({
        email: newsletterEmail,
        source: 'homepage'
      });
      
      toast.success(response.message || 'Successfully subscribed to newsletter!');
      setNewsletterEmail('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to subscribe. Please try again.');
    } finally {
      setNewsletterLoading(false);
    }
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
    toast.success('Added to cart!');
  };

  const featuredProducts = products.slice(0, 4);
  const categories = [
    { name: 'Electronics', icon: '📱', color: 'bg-blue-100' },
    { name: 'Clothing', icon: '👕', color: 'bg-green-100' },
    { name: 'Home & Garden', icon: '🏠', color: 'bg-yellow-100' },
    { name: 'Sports', icon: '⚽', color: 'bg-red-100' },
    { name: 'Beauty', icon: '💄', color: 'bg-pink-100' },
    { name: 'Books', icon: '📚', color: 'bg-purple-100' },
    { name: 'Health', icon: '🏥', color: 'bg-indigo-100' },
    { name: 'Toys', icon: '🧸', color: 'bg-orange-100' },
  ];

  const features = [
    {
      icon: TruckIcon,
      title: t('home.features.freeShipping'),
      description: `${t('common.freeShipping')} ${formatPrice(50)}`
    },
    {
      icon: ShieldCheckIcon,
      title: t('home.features.securePayment'),
      description: t('home.features.securePaymentDesc')
    },
    {
      icon: CurrencyDollarIcon,
      title: t('home.features.moneyBack'),
      description: t('home.features.moneyBackDesc')
    },
    {
      icon: PhoneIcon,
      title: t('home.features.support'),
      description: t('home.features.supportDesc')
    }
  ];

  return (
    <div>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              {t('home.welcomeTitle')}
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
              {t('home.welcomeSubtitle')}
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/products"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center justify-center"
              >
                {t('home.shopNow')}
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/sales"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors inline-flex items-center justify-center"
              >
                {t('common.todaysDeals')}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4">
                  <feature.icon className="h-12 w-12 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('home.shopCategory')}</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {t('home.exploreCategories')}
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <Link
                key={category.name}
                to={`/products?category=${category.name}`}
                className="group animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className={`${category.color} rounded-xl p-6 text-center shadow-sm hover:shadow-xl transition-all duration-300 group-hover:-translate-y-2`}>
                  <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform duration-300">{category.icon}</div>
                  <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{t(`categories.${category.name}`)}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Products */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('home.featuredProducts')}</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {t('home.discoverFeatured')}
            </p>
          </div>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading products...</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {featuredProducts.map((product, index) => (
                  <div key={product._id} className="animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                    <ProductCard 
                      product={product} 
                      onAddToCart={() => handleAddToCart(product)}
                    />
                  </div>
                ))}
              </div>
              
              <div className="text-center">
                <Link
                  to="/products"
                  className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  {t('home.viewAllProducts')}
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </Link>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="bg-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">{t('home.stayUpdated')}</h2>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            {t('home.subscribeText')}
          </p>
          <form onSubmit={handleNewsletterSubscribe} className="max-w-md mx-auto flex flex-col sm:flex-row gap-4">
            <input
              type="email"
              placeholder={t('home.enterEmail')}
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              disabled={newsletterLoading}
              className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-50"
            />
            <button 
              type="submit"
              disabled={newsletterLoading}
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {newsletterLoading ? t('home.subscribing') : t('home.subscribe')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};


export default HomePage;
