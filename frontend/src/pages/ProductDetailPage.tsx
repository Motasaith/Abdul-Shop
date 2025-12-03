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
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import WishlistButton from '../components/common/WishlistButton';
import toast from 'react-hot-toast';
import { formatPrice } from '../utils/currency';

const ProductDetailPage: React.FC = () => {
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

  const handleAddToCart = () => {
    if (!product) return;
    
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

  const handleSubmitQuestion = () => {
    if (!newQuestion.trim()) {
      toast.error('Please enter a question');
      return;
    }
    
    if (!user) {
      toast.error('Please login to ask a question');
      return;
    }
    
    // TODO: Implement question submission API
    toast.success('Question submitted successfully!');
    setNewQuestion('');
  };

  const handleSubmitReview = () => {
    if (!newReview.comment.trim()) {
      toast.error('Please enter a review comment');
      return;
    }
    
    if (!user) {
      toast.error('Please login to write a review');
      return;
    }
    
    // TODO: Implement review submission API
    toast.success('Review submitted successfully!');
    setNewReview({ rating: 5, comment: '' });
    setShowReviewForm(false);
  };

  const handleBuyNow = () => {
    if (!product) return;
    
    if (!user) {
      toast.error('Please login to buy now');
      navigate('/login');
      return;
    }
    
    // Add item to cart and navigate to checkout
    dispatch(addToCart({
      product: product._id,
      name: product.name,
      image: product.images[0]?.url || '',
      price: product.price,
      countInStock: product.countInStock,
      quantity
    }));
    
    // Navigate directly to checkout
    navigate('/checkout');
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
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Product Section */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8 p-4 sm:p-6">
            {/* Product Images */}
            <div className="lg:col-span-2 space-y-4">
              <div className="aspect-w-1 aspect-h-1 bg-gray-200 rounded-lg overflow-hidden">
                {allMedia.length > 0 ? (
                  <img
                    src={allMedia[selectedImage]?.url || 'https://via.placeholder.com/600x600?text=No+Image'}
                    alt={product.name}
                    className="w-full h-64 sm:h-80 lg:h-96 object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/600x600?text=No+Image';
                    }}
                  />
                ) : (
                  <div className="w-full h-64 sm:h-80 lg:h-96 flex items-center justify-center bg-gray-200">
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
                        selectedImage === index ? 'border-blue-600' : 'border-gray-300'
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
                <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
                <p className="text-gray-600 mt-2">{product.category}</p>
                {product.brand && (
                  <p className="text-blue-600 font-medium mt-1">By {product.brand}</p>
                )}
              </div>

              {/* Rating */}
              <div className="flex items-center space-x-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    i < Math.floor(product.rating) ? (
                      <StarSolidIcon key={i} className="h-5 w-5 text-yellow-400" />
                    ) : (
                      <StarIcon key={i} className="h-5 w-5 text-gray-300" />
                    )
                  ))}
                </div>
                <span className="text-sm text-gray-600">({product.numReviews} reviews)</span>
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

              {/* Stock */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Availability:</span>
                <span className={`text-sm font-medium ${
                  product.countInStock > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {product.countInStock > 0 ? `${product.countInStock} in stock` : 'Out of stock'}
                </span>
              </div>

              {/* Quantity and Add to Cart */}
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-2 text-gray-600 hover:text-gray-800"
                    >
                      -
                    </button>
                    <span className="px-4 py-2 border-x border-gray-300">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.countInStock, quantity + 1))}
                      className="px-3 py-2 text-gray-600 hover:text-gray-800"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-sm text-gray-600">Only {product.countInStock} left in stock</span>
                </div>
                
                <div className="flex space-x-3">
                  <WishlistButton 
                    productId={product._id}
                    className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    size="md"
                  />
                  <button
                    onClick={handleAddToCart}
                    disabled={product.countInStock === 0}
                    className="flex-1 bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                  >
                    <ShoppingCartIcon className="h-5 w-5" />
                    <span>Add to Cart</span>
                  </button>
                  <button 
                    onClick={handleBuyNow}
                    disabled={product.countInStock === 0}
                    className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            </div>

            {/* Delivery & Service Info */}
            <div className="lg:col-span-1 space-y-4">
              {/* Delivery Options */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <TruckIcon className="h-5 w-5 mr-2" />
                  Delivery Options
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <MapPinIcon className="h-4 w-4 text-gray-600 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">{deliveryAddress}</span>
                        <button className="text-blue-600 text-xs hover:underline">CHANGE</button>
                      </div>
                    </div>
                  </div>
                  
                  {product.deliveryInfo?.standardDelivery?.available && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <TruckIcon className="h-4 w-4 text-gray-600" />
                        <span className="text-sm text-gray-700">Standard Delivery</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">Rs. {product.deliveryInfo.standardDelivery.cost || 135}</div>
                        <div className="text-xs text-gray-500">{product.deliveryInfo.standardDelivery.days}</div>
                      </div>
                    </div>
                  )}
                  
                  {product.deliveryInfo?.cashOnDelivery?.available && (
                    <div className="flex items-center space-x-2">
                      <CurrencyDollarIcon className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-600 font-medium">Cash on Delivery Available</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Return & Warranty */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <ShieldCheckIcon className="h-5 w-5 mr-2" />
                  Return & Warranty
                </h3>
                
                <div className="space-y-3">
                  {product.returnPolicy?.available && (
                    <div className="flex items-center space-x-2">
                      <ArrowPathIcon className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-gray-700">
                        {product.returnPolicy.days} days easy return
                      </span>
                    </div>
                  )}
                  
                  {product.warranty?.available ? (
                    <div className="flex items-center space-x-2">
                      <CheckBadgeIcon className="h-4 w-4 text-blue-600" />
                      <span className="text-sm text-gray-700">
                        {product.warranty.duration} {product.warranty.type} warranty
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <ExclamationTriangleIcon className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-500">
                        Warranty not available
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {['description', 'specifications', 'whatsInBox', 'reviews', 'questions'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab === 'description' && 'Product Description'}
                  {tab === 'specifications' && 'Specifications'}
                  {tab === 'whatsInBox' && "What's in the Box"}
                  {tab === 'reviews' && `Reviews (${product.numReviews})`}
                  {tab === 'questions' && 'Questions & Answers'}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'description' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Description</h3>
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed">{product.description}</p>
                  {product.tags && product.tags.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-md font-medium text-gray-900 mb-2">Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {product.tags.map((tag, index) => (
                          <span key={index} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
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
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Specifications</h3>
                {product.specifications && product.specifications.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {product.specifications.map((spec, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <dt className="font-medium text-gray-900">{spec.name}</dt>
                        <dd className="text-gray-700 mt-1">{spec.value}</dd>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No specifications available for this product.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'whatsInBox' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">What's in the Box</h3>
                {product.whatsInBox && product.whatsInBox.length > 0 ? (
                  <ul className="space-y-2">
                    {product.whatsInBox.map((item, index) => (
                      <li key={index} className="flex items-center space-x-3">
                        <div className="flex-shrink-0 w-2 h-2 bg-orange-500 rounded-full"></div>
                        <span className="text-gray-700">{item.quantity}x {item.item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No box contents information available.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Customer Reviews</h3>
                  {user && (
                    <button
                      onClick={() => setShowReviewForm(!showReviewForm)}
                      className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors"
                    >
                      Write a Review
                    </button>
                  )}
                </div>

                {/* Review Form */}
                {showReviewForm && user && (
                  <div className="bg-gray-50 p-6 rounded-lg mb-6">
                    <h4 className="text-md font-semibold text-gray-900 mb-4">Write Your Review</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
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
                                <StarIcon className="h-6 w-6 text-gray-300" />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Review</label>
                        <textarea
                          value={newReview.comment}
                          onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
                          rows={4}
                          className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          placeholder="Write your review here..."
                        />
                      </div>
                      <div className="flex space-x-3">
                        <button
                          onClick={handleSubmitReview}
                          className="bg-orange-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-orange-600 transition-colors"
                        >
                          Submit Review
                        </button>
                        <button
                          onClick={() => setShowReviewForm(false)}
                          className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-400 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Reviews List */}
                {product.reviews && product.reviews.length > 0 ? (
                  <div className="space-y-6">
                    {(showAllReviews ? product.reviews : product.reviews.slice(0, 3)).map((review, index) => (
                      <div key={index} className="border-b border-gray-200 pb-6 last:border-b-0">
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0">
                            <UserCircleIcon className="h-10 w-10 text-gray-400" />
                          </div>
                          <div className="flex-grow">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="font-medium text-gray-900">{review.name}</span>
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  i < review.rating ? (
                                    <StarSolidIcon key={i} className="h-4 w-4 text-yellow-400" />
                                  ) : (
                                    <StarIcon key={i} className="h-4 w-4 text-gray-300" />
                                  )
                                ))}
                              </div>
                            </div>
                            <p className="text-gray-700">{review.comment}</p>
                            <p className="text-sm text-gray-500 mt-2">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </p>
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
                    <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'questions' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Questions & Answers</h3>
                </div>

                {/* Ask Question Form */}
                {user && (
                  <div className="bg-gray-50 p-6 rounded-lg mb-6">
                    <h4 className="text-md font-semibold text-gray-900 mb-4">Ask a Question</h4>
                    <div className="space-y-4">
                      <textarea
                        value={newQuestion}
                        onChange={(e) => setNewQuestion(e.target.value)}
                        rows={3}
                        className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        placeholder="Ask your question about this product..."
                      />
                      <div className="flex space-x-3">
                        <button
                          onClick={handleSubmitQuestion}
                          className="bg-orange-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-orange-600 transition-colors"
                        >
                          Submit Question
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Questions List */}
                {product.qnaQuestions && product.qnaQuestions.length > 0 ? (
                  <div className="space-y-6">
                    {product.qnaQuestions.map((qna, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="mb-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <ChatBubbleLeftRightIcon className="h-5 w-5 text-blue-600" />
                            <span className="font-medium text-gray-900">Q: {qna.question}</span>
                          </div>
                          <p className="text-sm text-gray-500 ml-7">
                            Asked by {qna.userName} on {new Date(qna.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        
                        {qna.answer && qna.answer.text && (
                          <div className="ml-7 bg-blue-50 p-3 rounded-lg">
                            <div className="flex items-start space-x-2">
                              <span className="font-medium text-blue-900">A:</span>
                              <div>
                                <p className="text-blue-900">{qna.answer.text}</p>
                                <p className="text-sm text-blue-700 mt-1">
                                  Answered by {qna.answer.answeredByName} on {new Date(qna.answer.answeredAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
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
                      <span className="font-bold text-orange-600">Rs. {similarProduct.price}</span>
                      {similarProduct.comparePrice && (
                        <span className="text-sm text-gray-500 line-through">
                          Rs. {similarProduct.comparePrice}
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
    </div>
  );
};

export default ProductDetailPage;
