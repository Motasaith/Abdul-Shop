import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchUserReviews } from '../store/slices/productSlice';
import { StarIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { productService } from '../services/productService';
import toast from 'react-hot-toast';

const MyReviewsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Follow-up state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<any | null>(null);
  const [followUpComment, setFollowUpComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadReviews = async () => {
    try {
      const result = await dispatch(fetchUserReviews()).unwrap();
      setReviews(result);
    } catch (err: any) {
      setError(err.message || 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadReviews();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, user]);

  const openFollowUpModal = (review: any) => {
    setSelectedReview(review);
    setFollowUpComment('');
    setIsModalOpen(true);
  };

  const closeFollowUpModal = () => {
    setIsModalOpen(false);
    setSelectedReview(null);
    setFollowUpComment('');
  };

  const handleSubmitFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReview) return;

    try {
      setSubmitting(true);
      await productService.addFollowUpReview(
        selectedReview.product._id,
        selectedReview._id,
        followUpComment
      );
      toast.success('Follow-up review submitted successfully');
      closeFollowUpModal();
      loadReviews(); // Reload to show the new follow-up
    } catch (err: any) {
      console.error('Submit follow-up error:', err);
      // Backend returns 400 with msg for "same day" error
      const msg = err.response?.data?.msg || 'Failed to submit follow-up review';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 py-8">
        <div className="max-w-4xl mx-auto bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-6 py-4 rounded-lg">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-8">My Reviews</h1>

        {reviews.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <StarIcon className="w-12 h-12 text-gray-400 dark:text-gray-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No reviews yet</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-sm mx-auto">You haven't written any reviews yet. Share your thoughts on products you've purchased!</p>
            <Link
              to="/orders"
              className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm"
            >
              View My Orders
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden p-6 transition-colors duration-200">
                <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
                  <div className="flex-shrink-0">
                    <img
                      src={review.product.image || 'https://via.placeholder.com/100'}
                      alt={review.product.name}
                      className="w-20 h-20 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                    />
                  </div>
                  <div className="flex-1 w-full">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2 gap-2">
                      <div>
                        <Link 
                          to={`/products/${review.product._id}`}
                          className="text-lg font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                          {review.product.name}
                        </Link>
                        <div className="flex items-center mt-1">
                          {[...Array(5)].map((_, i) => (
                            <StarIcon
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="mt-3 text-gray-700 dark:text-gray-300 leading-relaxed">{review.comment}</p>

                    {/* Follow-up Section */}
                    {review.followUp ? (
                      <div className="mt-4 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border-l-4 border-blue-500 dark:border-blue-400">
                        <p className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-1">
                          Follow-up ({new Date(review.followUp.date).toLocaleDateString()}):
                        </p>
                        <p className="text-gray-700 dark:text-gray-300 text-sm">{review.followUp.comment}</p>
                      </div>
                    ) : (
                      <div className="mt-4">
                        <button
                          onClick={() => openFollowUpModal(review)}
                          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium underline transition-colors"
                        >
                          Write a Follow-up Review
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Follow-up Modal */}
      {isModalOpen && selectedReview && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity backdrop-blur-sm" aria-hidden="true" onClick={closeFollowUpModal}></div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-middle bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-lg sm:w-full border border-gray-200 dark:border-gray-700">
              <div className="px-4 pt-5 pb-4 sm:p-6">
                <div className="flex justify-between items-start mb-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white" id="modal-title">
                    Follow-up Review for {selectedReview.product.name}
                  </h3>
                  <button
                    onClick={closeFollowUpModal}
                    className="bg-transparent rounded-md text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none"
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                
                <form onSubmit={handleSubmitFollowUp}>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                      Share your updated experience with this product. Note: You cannot write a follow-up on the same day as delivery.
                    </p>
                    <textarea
                      rows={4}
                      className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm placeholder-gray-400 dark:placeholder-gray-500"
                      placeholder="Write your follow-up review here..."
                      value={followUpComment}
                      onChange={(e) => setFollowUpComment(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mt-6 flex flex-col sm:flex-row-reverse gap-3">
                    <button
                      type="submit"
                      disabled={submitting}
                      className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:w-auto sm:text-sm ${
                        submitting ? 'opacity-75 cursor-not-allowed' : ''
                      }`}
                    >
                      {submitting ? 'Submitting...' : 'Submit Follow-up'}
                    </button>
                    <button
                      type="button"
                      className="w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-700 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:w-auto sm:text-sm"
                      onClick={closeFollowUpModal}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyReviewsPage;
