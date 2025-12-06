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
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Reviews</h1>

        {reviews.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <div className="w-24 h-24 mx-auto mb-4 text-gray-400">
              <StarIcon className="w-24 h-24 text-gray-300" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No reviews yet</h2>
            <p className="text-gray-600 mb-4">You haven't written any reviews yet.</p>
            <Link
              to="/orders"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              View My Orders
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review._id} className="bg-white rounded-lg shadow-md overflow-hidden p-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <img
                      src={review.product.image || 'https://via.placeholder.com/100'}
                      alt={review.product.name}
                      className="w-20 h-20 object-cover rounded-md"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <Link 
                          to={`/products/${review.product._id}`}
                          className="text-lg font-semibold text-gray-900 hover:text-blue-600"
                        >
                          {review.product.name}
                        </Link>
                        <div className="flex items-center mt-1">
                          {[...Array(5)].map((_, i) => (
                            <StarIcon
                              key={i}
                              className={`h-5 w-5 ${
                                i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="mt-3 text-gray-700">{review.comment}</p>

                    {/* Follow-up Section */}
                    {review.followUp ? (
                      <div className="mt-4 bg-gray-50 p-4 rounded-md border-l-4 border-blue-500">
                        <p className="text-sm font-semibold text-blue-700 mb-1">
                          Follow-up ({new Date(review.followUp.date).toLocaleDateString()}):
                        </p>
                        <p className="text-gray-700 text-sm">{review.followUp.comment}</p>
                      </div>
                    ) : (
                      <div className="mt-4">
                        <button
                          onClick={() => openFollowUpModal(review)}
                          className="text-sm text-blue-600 hover:text-blue-800 font-medium underline"
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
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={closeFollowUpModal}></div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                    Follow-up Review for {selectedReview.product.name}
                  </h3>
                  <button
                    onClick={closeFollowUpModal}
                    className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                
                <form onSubmit={handleSubmitFollowUp}>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500 mb-4">
                      Share your updated experience with this product. Note: You cannot write a follow-up on the same day as delivery.
                    </p>
                    <textarea
                      rows={4}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="Write your follow-up review here..."
                      value={followUpComment}
                      onChange={(e) => setFollowUpComment(e.target.value)}
                      required
                    />
                  </div>
                  <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse mt-4 -mx-6 -mb-6">
                    <button
                      type="submit"
                      disabled={submitting}
                      className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm ${
                        submitting ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {submitting ? 'Submitting...' : 'Submit Follow-up'}
                    </button>
                    <button
                      type="button"
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
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
