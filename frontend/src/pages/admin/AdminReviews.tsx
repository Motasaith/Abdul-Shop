import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import adminService from '../../services/adminService';
import vendorService from '../../services/vendorService';
import { Product } from '../../types';
import { StarIcon, TrashIcon } from '@heroicons/react/20/solid';

const AdminReviews: React.FC = () => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      // For MVP, we fetch all products and flatten their reviews
      // In production, you'd want a dedicated /api/reviews endpoint with pagination
      const response = await adminService.getProducts({ limit: 1000 }); // Fetch generous amount
      const products = response.products;
      
      const allReviews = products.flatMap((product: Product) => 
        product.reviews.map(review => ({
          ...review,
          productName: product.name,
          productId: product._id,
          productImage: product.images[0]?.url
        }))
      );

      // Sort by newest
      allReviews.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      setReviews(allReviews);
    } catch (error) {
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleReplySubmit = async (productId: string, reviewId: string) => {
    if (!replyText.trim()) return;

    try {
      // Admins use same endpoint but have permission to reply to ANY
      await vendorService.replyToReview(productId, reviewId, replyText);
      toast.success('Reply posted');
      setReplyingTo(null);
      setReplyText('');
      fetchReviews(); 
    } catch (error) {
      toast.error('Failed to post reply');
    }
  };

  return (
    <div className="space-y-6">
       <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Review Management</h1>
            <p className="text-gray-500 dark:text-gray-400">Monitor and moderate all customer reviews</p>
        </div>
      
      {loading ? (
        <div className="text-center py-10">Loading...</div>
      ) : (
        <div className="space-y-6">
          {reviews.length === 0 ? (
             <div className="text-center py-10 text-gray-500 dark:text-gray-400">No reviews found in the system.</div>
          ) : (
             reviews.map((review) => (
                <div key={review._id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow transition-colors duration-300">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-4">
                       <img 
                            src={review.productImage || 'https://via.placeholder.com/150'} 
                            alt={review.productName} 
                            className="w-16 h-16 object-cover rounded-md" 
                       />
                       <div>
                         <h3 className="font-semibold text-gray-900 dark:text-white">{review.productName}</h3>
                         <div className="flex items-center gap-1 my-1">
                            {[...Array(5)].map((_, i) => (
                              <StarIcon key={i} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`} />
                            ))}
                         </div>
                         <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{review.name}</span>
                            <span className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</span>
                         </div>
                         <p className="text-gray-600 dark:text-gray-300 mt-2">{review.comment}</p>
                       </div>
                    </div>
                  </div>

                  {/* Existing Reply */}
                  {review.vendorReply && (
                    <div className="mt-4 ml-20 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border-l-4 border-blue-500">
                      <p className="text-sm font-bold text-gray-900 dark:text-white mb-1">Reply:</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{review.vendorReply.comment}</p>
                    </div>
                  )}

                  {/* Reply Form */}
                  {!review.vendorReply && replyingTo !== review._id && (
                    <div className="mt-2 ml-20">
                         <button 
                            onClick={() => setReplyingTo(review._id)}
                            className="text-blue-600 hover:underline text-sm font-medium"
                          >
                            Post Admin Reply
                          </button>
                    </div>
                  )}

                  {replyingTo === review._id && (
                    <div className="mt-4 ml-20">
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500"
                        placeholder="Type your official response..."
                        rows={3}
                      />
                      <div className="flex gap-2 mt-2">
                        <button 
                          onClick={() => handleReplySubmit(review.productId, review._id)}
                          className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                        >
                          Post Reply
                        </button>
                        <button 
                          onClick={() => setReplyingTo(null)}
                          className="text-gray-500 text-sm hover:underline"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
             ))
          )}
        </div>
      )}
    </div>
  );
};

export default AdminReviews;
