import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchProduct, fetchProductsByCategory } from '../store/slices/productSlice';
import { addToCart } from '../store/slices/cartSlice';
import { 
  StarIcon, 
  ShoppingCartIcon, 
  TruckIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  ArrowPathIcon,
  MapPinIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ChatBubbleLeftRightIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  UserCircleIcon,
  PencilIcon,
  CheckBadgeIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  MagnifyingGlassPlusIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import WishlistButton from '../components/common/WishlistButton';
import toast from 'react-hot-toast';
import { usePrice } from '../hooks/usePrice';
// Service import
import productService from '../services/productService';

import { useTranslation } from '../hooks/useTranslation';

const ProductDetailPage: React.FC = () => {
  const { formatPrice } = usePrice();
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { product, products, loading, error } = useAppSelector((state) => state.products);
  const { user } = useAppSelector((state) => state.auth);
  
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [deliveryAddress, setDeliveryAddress] = useState('Sindh, Karachi - Gulshan-e-Iqbal, Block 15');
  const [newQuestion, setNewQuestion] = useState('');
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewImages, setReviewImages] = useState<File[]>([]);
  // Admin answer state
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [answeringId, setAnsweringId] = useState<string | null>(null);
  
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const handleReviewImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      // Optional: Add validation for size/type here
      setReviewImages(prev => [...prev, ...filesArray]);
    }
  };

  useEffect(() => {
    if (id) {
      dispatch(fetchProduct(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (product?.category) {
      dispatch(fetchProductsByCategory(product.category));
    }
  }, [dispatch, product?.category]);

  const { items } = useAppSelector((state) => state.cart);

  const handleAddToCart = () => {
    if (!product) return;
    
    const existingItem = items.find(item => item.product === product._id);
    const currentQty = existingItem ? existingItem.quantity : 0;
    
    if (currentQty + quantity > product.countInStock) {
      toast.error(`Cannot add more items. You already have ${currentQty} in cart and only ${product.countInStock} are available.`);
      return;
    }
    
    dispatch(addToCart({
      product: product._id,
      name: product.name,
      image: product.images[0]?.url || '',
      price: product.price,
      countInStock: product.countInStock,
      quantity
    }));
    
    toast.success(`${product.name} added to cart!`);
  };

  const handleSubmitQuestion = async () => {
    if (!newQuestion.trim()) {
      toast.error('Please enter a question');
      return;
    }
    
    if (!user) {
      toast.error('Please login to ask a question');
      return;
    }
    
    try {
      await productService.addProductQuestion(id!, { question: newQuestion });
      toast.success('Question submitted successfully!');
      setNewQuestion('');
      
      // Refresh product data
      if (id) {
        dispatch(fetchProduct(id));
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.msg || 'Failed to submit question';
      toast.error(errorMessage);
    }
  };

  const handleSubmitReview = async () => {
    if (!newReview.comment.trim()) {
      toast.error('Please enter a review comment');
      return;
    }
    
    if (!user) {
      toast.error('Please login to write a review');
      return;
    }
    
    try {
      // Use FormData for image upload
      const formData = new FormData();
      formData.append('rating', newReview.rating.toString());
      formData.append('comment', newReview.comment);
      
      // Append images
      reviewImages.forEach((file) => {
        formData.append('images', file);
      });

      await productService.addProductReview(id!, formData);
      toast.success('Review submitted successfully!');
      
      // Reset form
      setNewReview({ rating: 5, comment: '' });
      setNewReview({ rating: 5, comment: '' });
      setReviewImages([]);
      setShowReviewForm(false);
      
      // Refresh product data
      if (id) {
        dispatch(fetchProduct(id));
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.msg || 'Failed to submit review';
      toast.error(errorMessage);
    }
  };

  const handleAnswerSubmit = async (questionId: string) => {
    const answerText = answers[questionId];
    if (!answerText?.trim()) return;

    try {
      await productService.answerProductQuestion(id!, questionId, { answer: answerText });
      toast.success('Answer submitted successfully');
      setAnsweringId(null);
      // Refresh
      if (id) dispatch(fetchProduct(id)); // Re-fetch product to update Q&A
    } catch (err: any) {
      const msg = err.response?.data?.msg || 'Failed to submit answer';
      toast.error(msg);
    }
  };

  const handleBuyNow = () => {
    if (!product) return;
    
    if (!user) {
      toast.error('Please login to buy now');
      navigate('/login');
      return;
    }
    
    const buyNowItem = {
      product: product._id,
      name: product.name,
      image: product.images[0]?.url || '',
      price: product.price,
      countInStock: product.countInStock,
      quantity
    };
    
    // Navigate directly to checkout with the item in state
    navigate('/checkout', { state: { buyNowItem } });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h2>
          <p className="text-gray-600">The product you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const images = product.images || [];
  const videos = product.videos || [];
  const allMedia = [...images, ...videos];
  const similarProducts = products?.filter(p => p._id !== product._id && p.category === product.category).slice(0, 4) || [];

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Product Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-6 transition-colors duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8 p-4 sm:p-6">
            {/* Product Images */}
            <div className="lg:col-span-2 space-y-4">
              <div 
                className="aspect-w-1 aspect-h-1 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden relative group cursor-zoom-in"
                onClick={() => setIsLightboxOpen(true)}
              >
                {allMedia.length > 0 ? (
                  <>
                    <img
                      src={allMedia[selectedImage]?.url || 'https://via.placeholder.com/600x600?text=No+Image'}
                      alt={product.name}
                      className="w-full h-64 sm:h-80 lg:h-96 object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/600x600?text=No+Image';
                      }}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 duration-300">
                       <div className="bg-white/80 dark:bg-black/60 p-3 rounded-full backdrop-blur-sm shadow-sm">
                          <MagnifyingGlassPlusIcon className="w-6 h-6 text-gray-800 dark:text-white" />
                       </div>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-64 sm:h-80 lg:h-96 flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                    <span className="text-gray-400">No image available</span>
                  </div>
                )}
              </div>
              
              {/* Thumbnail Images */}
              {allMedia.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto">
                  {allMedia.map((media, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${
                        selectedImage === index ? 'border-blue-600' : 'border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      <img
                        src={media.url}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/64x64?text=No+Image';
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{product.name}</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">{product.category}</p>
                {product.brand && (
                  <p className="text-blue-600 font-medium mt-1">By {product.brand}</p>
                )}
                {product.owner && typeof product.owner !== 'string' && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Sold by: <Link to={`/shop/${product.owner._id}`} className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                      {product.owner.vendorDetails?.shopName || product.owner.name || 'ShopHub'}
                    </Link>
                  </p>
                )}
              </div>

              {/* Rating */}
              <div className="flex items-center space-x-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    i < Math.floor(product.rating) ? (
                      <StarSolidIcon key={i} className="h-5 w-5 text-yellow-400" />
                    ) : (
                      <StarIcon key={i} className="h-5 w-5 text-gray-300 dark:text-gray-600" />
                    )
                  ))}
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">({product.numReviews} {t('product.reviews')})</span>
              </div>

              {/* Price */}
              <div className="flex items-center space-x-4">
                <span className="text-3xl font-bold text-orange-600">{formatPrice(product.price)}</span>
                {product.comparePrice && (
                  <>
                    <span className="text-xl text-gray-500 line-through">{formatPrice(product.comparePrice)}</span>
                    <span className="bg-orange-100 text-orange-600 px-2 py-1 rounded text-sm font-medium">
                      -{Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)}%
                    </span>
                  </>
                )}
              </div>

               {/* Flash Sale Countdown */}
               {product.onSale && product.saleEndDate && new Date(product.saleEndDate) > new Date() && (
                 <div className="inline-flex items-center gap-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-3 py-1.5 rounded-lg border border-red-100 dark:border-red-800/50 text-sm font-semibold animate-pulse">
                    <ClockIcon className="w-4 h-4" />
                    <span>Flash Sale Ends: {new Date(product.saleEndDate).toLocaleDateString()}</span>
                 </div>
               )}

              {/* Stock */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Availability:</span>
                <span className={`text-sm font-medium ${
                  product.countInStock > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {product.countInStock > 0 ? `${product.countInStock} ${t('product.inStock')}` : t('product.outOfStock')}
                </span>
              </div>

              {/* Quantity and Add to Cart */}
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
                    >
                      -
                    </button>
                    <span className="px-4 py-2 border-x border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.countInStock, quantity + 1))}
                      className="px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">{t('product.onlyLeft', { count: product.countInStock })}</span>
                </div>
                
                <div className="flex space-x-3">
                  <WishlistButton 
                    productId={product._id}
                    className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    size="md"
                  />
                  <button
                    onClick={handleAddToCart}
                    disabled={product.countInStock === 0}
                    className="flex-1 bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                  >
                    <ShoppingCartIcon className="h-5 w-5" />
                    <span>{t('product.addToCart')}</span>
                  </button>
                  <button 
                    onClick={handleBuyNow}
                    disabled={product.countInStock === 0}
                    className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {t('product.buyNow')}
                  </button>
                </div>
              </div>
            </div>

            {/* Delivery & Service Info */}
            <div className="lg:col-span-1 space-y-4">
              {/* Delivery Options */}
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg transition-colors duration-300">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                  <TruckIcon className="h-5 w-5 mr-2" />
                  {t('product.deliveryOptions')}
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <MapPinIcon className="h-4 w-4 text-gray-600 dark:text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700 dark:text-gray-300">{deliveryAddress}</span>
                        <button className="text-blue-600 dark:text-blue-400 text-xs hover:underline">CHANGE</button>
                      </div>
                    </div>
                  </div>
                  
                  {product.deliveryInfo?.standardDelivery?.available && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <TruckIcon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{t('product.standardDelivery')}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{formatPrice(product.deliveryInfo.standardDelivery.cost || 135)}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{product.deliveryInfo.standardDelivery.days}</div>
                      </div>
                    </div>
                  )}
                  
                  {product.deliveryInfo?.cashOnDelivery?.available && (
                    <div className="flex items-center space-x-2">
                      <CurrencyDollarIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <span className="text-sm text-green-600 dark:text-green-400 font-medium">{t('product.codAvailable')}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Return & Warranty */}
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg transition-colors duration-300">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                  <ShieldCheckIcon className="h-5 w-5 mr-2" />
                  {t('product.returnWarranty')}
                </h3>
                
                <div className="space-y-3">
                  {product.returnPolicy?.available && (
                    <div className="flex items-center space-x-2">
                      <ArrowPathIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {product.returnPolicy.days} {t('product.easyReturn')}
                      </span>
                    </div>
                  )}
                  
                  {product.warranty?.available ? (
                    <div className="flex items-center space-x-2">
                      <CheckBadgeIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {product.warranty.duration} {product.warranty.type} {t('product.warranty')}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <ExclamationTriangleIcon className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {t('product.warrantyNotAvailable')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-6 transition-colors duration-300">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-4 md:space-x-8 px-4 md:px-6 overflow-x-auto whitespace-nowrap scrollbar-hide">
              {['description', 'specifications', 'whatsInBox', 'reviews', 'questions'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab
                      ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  {tab === 'description' && t('product.description')}
                  {tab === 'specifications' && t('product.specifications')}
                  {tab === 'whatsInBox' && t('product.whatsInBox')}
                  {tab === 'reviews' && `${t('product.reviews')} (${product.numReviews})`}
                  {tab === 'questions' && t('product.questions')}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'description' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('product.description')}</h3>
                <div className="prose max-w-none dark:prose-invert">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{product.description}</p>
                  {product.tags && product.tags.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-md font-medium text-gray-900 dark:text-white mb-2">Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {product.tags.map((tag, index) => (
                          <span key={index} className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full text-sm">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'specifications' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('product.specifications')}</h3>
                {product.specifications && product.specifications.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {product.specifications.map((spec, index) => (
                      <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <dt className="font-medium text-gray-900 dark:text-white">{spec.name}</dt>
                        <dd className="text-gray-700 dark:text-gray-300 mt-1">{spec.value}</dd>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">{t('product.noSpecs')}</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'whatsInBox' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('product.whatsInBox')}</h3>
                {product.whatsInBox && product.whatsInBox.length > 0 ? (
                  <ul className="space-y-2">
                    {product.whatsInBox.map((item, index) => (
                      <li key={index} className="flex items-center space-x-3">
                        <div className="flex-shrink-0 w-2 h-2 bg-orange-500 rounded-full"></div>
                        <span className="text-gray-700 dark:text-gray-300">{item.quantity}x {item.item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">{t('product.noBoxContent')}</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('product.reviews')}</h3>
                  {user && (
                    <button
                      onClick={() => setShowReviewForm(!showReviewForm)}
                      className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors"
                    >
                      {t('product.writeReview')}
                    </button>
                  )}
                </div>

                {/* Review Form */}
                {showReviewForm && user && (
                  <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg mb-6">
                    <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4">{t('product.writeYourReview')}</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('product.rating')}</label>
                        <div className="flex items-center space-x-1">
                          {[1, 2, 3, 4, 5].map((rating) => (
                            <button
                              key={rating}
                              onClick={() => setNewReview({...newReview, rating})}
                              className="focus:outline-none"
                            >
                              {rating <= newReview.rating ? (
                                <StarSolidIcon className="h-6 w-6 text-yellow-400" />
                              ) : (
                                <StarIcon className="h-6 w-6 text-gray-300 dark:text-gray-500" />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Review</label>
                        <textarea
                          value={newReview.comment}
                          onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
                          rows={4}
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          placeholder={t('product.review') + "..."}
                        />
                      </div>
                      
                      {/* Image Upload Section */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('product.addPhotos')}</label>
                        <div className="flex items-center space-x-4">
                          <label className="cursor-pointer bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center space-x-2">
                            <ArrowPathIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">{t('product.chooseFiles')}</span>
                            <input
                              type="file"
                              multiple
                              accept="image/*"
                              className="hidden"
                              onChange={handleReviewImageChange}
                            />
                          </label>
                          <span className="text-sm text-gray-500">
                            {reviewImages.length} file(s) selected
                          </span>
                        </div>
                        
                        {/* Image Previews */}
                        {reviewImages.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {reviewImages.map((file, index) => (
                              <div key={index} className="relative w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600">
                                <img
                                  src={URL.createObjectURL(file)}
                                  alt="Preview"
                                  className="w-full h-full object-cover"
                                />
                                <button
                                  onClick={() => {
                                    setReviewImages(prev => prev.filter((_, i) => i !== index));
                                  }}
                                  className="absolute top-0 right-0 bg-red-500 text-white p-0.5 rounded-bl opacity-75 hover:opacity-100"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                    <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                                  </svg>
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex space-x-3 pt-2">
                        <button
                          onClick={handleSubmitReview}
                          className="bg-orange-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-orange-600 transition-colors"
                        >
                          {t('product.submitReview')}
                        </button>
                        <button
                          onClick={() => {
                            setShowReviewForm(false);
                            setReviewImages([]);
                          }}
                          className="bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                        >
                          {t('product.cancel')}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Reviews List */}
                {product.reviews && product.reviews.length > 0 ? (
                  <div className="space-y-6">
                    {(showAllReviews ? product.reviews : product.reviews.slice(0, 3)).map((review, index) => (
                      <div key={index} className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-b-0">
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0">
                            <UserCircleIcon className="h-10 w-10 text-gray-400 dark:text-gray-500" />
                          </div>
                          <div className="flex-grow">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="font-medium text-gray-900 dark:text-white">{review.name}</span>
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  i < review.rating ? (
                                    <StarSolidIcon key={i} className="h-4 w-4 text-yellow-400" />
                                  ) : (
                                    <StarIcon key={i} className="h-4 w-4 text-gray-300 dark:text-gray-600" />
                                  )
                                ))}
                              </div>
                            </div>
                            <p className="text-gray-700 dark:text-gray-300">{review.comment}</p>
                            <p className="text-sm text-gray-500 mt-2">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </p>

                              {/* Follow-up Section */}
                              {review.followUp && (
                                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                                  <p className="text-xs font-semibold text-orange-600 mb-1">
                                    Follow-up ({new Date(review.followUp.date).toLocaleDateString()}):
                                  </p>
                                  <p className="text-gray-700 dark:text-gray-300 text-sm">{review.followUp.comment}</p>
                                </div>
                              )}
                              
                              {/* Vendor Reply Section */}
                              {review.vendorReply && (
                                <div className="mt-3 bg-blue-50 dark:bg-gray-700/50 p-3 rounded-lg border-l-4 border-blue-500 dark:border-blue-400">
                                    <div className="flex items-center gap-2 mb-1">
                                        <CheckBadgeIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                        <p className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">Seller Response</p>
                                    </div>
                                    <p className="text-gray-700 dark:text-gray-300 text-sm">{review.vendorReply.comment}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{new Date(review.vendorReply.date).toLocaleDateString()}</p>
                                </div>
                              )}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {product.reviews.length > 3 && (
                      <button
                        onClick={() => setShowAllReviews(!showAllReviews)}
                        className="text-orange-600 font-medium hover:text-orange-700 flex items-center space-x-1"
                      >
                        <span>{showAllReviews ? 'Show Less' : `Show All ${product.reviews.length} Reviews`}</span>
                        {showAllReviews ? (
                          <ChevronUpIcon className="h-4 w-4" />
                        ) : (
                          <ChevronDownIcon className="h-4 w-4" />
                        )}
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">{t('product.noReviews')}</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'questions' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('product.questions')}</h3>
                </div>

                {/* Ask Question Form */}
                {user && (
                  <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg mb-6">
                    <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4">{t('product.askQuestion')}</h4>
                    <div className="space-y-4">
                      <textarea
                        value={newQuestion}
                        onChange={(e) => setNewQuestion(e.target.value)}
                        rows={3}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        placeholder={t('product.askPlaceholder')}
                      />
                      <div className="flex space-x-3">
                        <button
                          onClick={handleSubmitQuestion}
                          className="bg-orange-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-orange-600 transition-colors"
                        >
                          {t('product.submitQuestion')}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Questions List */}
                {product.qnaQuestions && product.qnaQuestions.length > 0 ? (
                  <div className="space-y-6">
                    {product.qnaQuestions.map((qna, index) => (
                      <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <div className="mb-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <ChatBubbleLeftRightIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            <span className="font-medium text-gray-900 dark:text-white">Q: {qna.question}</span>
                          </div>
                          <p className="text-sm text-gray-500 ml-7">
                            Asked by {qna.userName} on {new Date(qna.createdAt).toLocaleDateString()}
                          </p>
                          
                          {/* Answer Section */}
                          {qna.answer ? (
                            <div className="mt-4 pl-4 border-l-2 border-orange-200 dark:border-orange-500/50">
                              <p className="text-gray-800 dark:text-gray-200 font-medium">A: {qna.answer.text}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Answered by {qna.answer.answeredByName} on {new Date(qna.answer.answeredAt).toLocaleDateString()}
                              </p>
                            </div>
                          ) : (
                            user && (user as any).role === 'admin' && (
                              <div className="mt-3">
                                {answeringId === qna._id ? (
                                  <div className="space-y-2">
                                    <textarea
                                      className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                                      rows={2}
                                      placeholder="Write an answer..."
                                      value={answers[qna._id] || ''}
                                      onChange={(e) => setAnswers({...answers, [qna._id]: e.target.value})}
                                    />
                                    <div className="flex space-x-2">
                                      <button
                                        onClick={() => handleAnswerSubmit(qna._id)}
                                        className="bg-orange-500 text-white px-3 py-1 rounded text-sm hover:bg-orange-600"
                                      >
                                        {t('product.submitAnswer')}
                                      </button>
                                      <button
                                        onClick={() => setAnsweringId(null)}
                                        className="bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-400"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => setAnsweringId(qna._id)}
                                    className="text-orange-600 text-sm hover:text-orange-700 font-medium"
                                  >
                                    {t('product.answerQ')}
                                  </button>
                                )}
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ChatBubbleLeftRightIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No questions asked yet. Be the first to ask!</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Similar Products */}
        {similarProducts.length > 0 && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">You May Also Like</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {similarProducts.map((similarProduct) => (
                  <Link
                    key={similarProduct._id}
                    to={`/products/${similarProduct._id}`}
                    className="group block"
                  >
                    <div className="bg-gray-100 rounded-lg overflow-hidden mb-3">
                      <img
                        src={similarProduct.images[0]?.url || 'https://via.placeholder.com/300x300?text=No+Image'}
                        alt={similarProduct.name}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/300x300?text=No+Image';
                        }}
                      />
                    </div>
                    <h4 className="font-medium text-gray-900 mb-1 group-hover:text-orange-600 transition-colors">
                      {similarProduct.name.length > 50 
                        ? `${similarProduct.name.substring(0, 50)}...` 
                        : similarProduct.name
                      }
                    </h4>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-orange-600">{formatPrice(similarProduct.price)}</span>
                      {similarProduct.comparePrice && (
                        <span className="text-sm text-gray-500 line-through">
                          {formatPrice(similarProduct.comparePrice)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center mt-1">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          i < Math.floor(similarProduct.rating) ? (
                            <StarSolidIcon key={i} className="h-3 w-3 text-yellow-400" />
                          ) : (
                            <StarIcon key={i} className="h-3 w-3 text-gray-300" />
                          )
                        ))}
                      </div>
                      <span className="text-xs text-gray-500 ml-1">({similarProduct.numReviews})</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md"
            onClick={() => setIsLightboxOpen(false)}
          >
            <button
              className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
              onClick={() => setIsLightboxOpen(false)}
            >
              <XMarkIcon className="w-8 h-8" />
            </button>

            <div className="relative w-full h-full flex flex-col items-center justify-center p-4">
              <motion.img
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                src={allMedia[selectedImage]?.url}
                alt={product.name}
                className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              />

              {allMedia.length > 1 && (
                 <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2 p-4 overflow-x-auto" onClick={(e) => e.stopPropagation()}>
                    {allMedia.map((media, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                          selectedImage === index 
                            ? 'border-white scale-110 shadow-lg' 
                            : 'border-white/30 opacity-60 hover:opacity-100 hover:border-white/60'
                        }`}
                      >
                        <img src={media.url} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                 </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductDetailPage;
