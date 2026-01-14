import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import productService from '../../services/productService';
import vendorService from '../../services/vendorService';
import { Product } from '../../types';

const VendorQnA: React.FC = () => {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [answeringTo, setAnsweringTo] = useState<string | null>(null);
  const [answerText, setAnswerText] = useState('');

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const response = await productService.getVendorProducts();
      const products = response.data;
      
      // Flatten questions from all products
      const allQuestions = products.flatMap((product: Product) => 
        (product.qnaQuestions || []).map((q: any) => ({
          ...q,
          productName: product.name,
          productId: product._id,
          productImage: product.images[0]?.url
        }))
      );

      // Sort by newest
      allQuestions.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      setQuestions(allQuestions);
    } catch (error) {
      toast.error('Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSubmit = async (productId: string, questionId: string) => {
    if (!answerText.trim()) return;

    try {
      await vendorService.answerQuestion(productId, questionId, answerText);
      toast.success('Answer posted');
      setAnsweringTo(null);
      setAnswerText('');
      fetchQuestions(); // Refresh
    } catch (error) {
      toast.error('Failed to post answer');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Customer Q&A</h1>
      
      {loading ? (
        <div className="text-center">Loading...</div>
      ) : (
        <div className="space-y-6">
          {questions.length === 0 ? (
             <div className="text-center py-10 text-gray-500 dark:text-gray-400">No questions yet.</div>
          ) : (
             questions.map((question) => (
                <div key={question._id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-4">
                       <img src={question.productImage} alt={question.productName} className="w-16 h-16 object-cover rounded-md" />
                       <div>
                         <h3 className="font-semibold text-gray-900 dark:text-white">{question.productName}</h3>
                         <p className="font-medium text-gray-700 dark:text-gray-200 mt-2">Q: {question.question}</p>
                         <p className="text-sm text-gray-500">Asked by {question.userName} on {new Date(question.createdAt).toLocaleDateString()}</p>
                       </div>
                    </div>
                  </div>

                  {/* Existing Answer */}
                  {question.answer ? (
                    <div className="mt-4 ml-20 bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border-l-4 border-green-500">
                      <p className="text-sm font-bold text-gray-900 dark:text-white mb-1">Answered by {question.answer.answeredByName}:</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{question.answer.text}</p>
                    </div>
                  ) : (
                    <>
                      {answeringTo !== question._id && (
                        <button 
                          onClick={() => setAnsweringTo(question._id)}
                          className="mt-4 ml-20 text-blue-600 hover:underline text-sm font-medium"
                        >
                          Answer Question
                        </button>
                      )}

                      {answeringTo === question._id && (
                        <div className="mt-4 ml-20">
                          <textarea
                            value={answerText}
                            onChange={(e) => setAnswerText(e.target.value)}
                            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            placeholder="Type your answer..."
                            rows={3}
                          />
                          <div className="flex gap-2 mt-2">
                            <button 
                              onClick={() => handleAnswerSubmit(question.productId, question._id)}
                              className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                            >
                              Post Answer
                            </button>
                            <button 
                              onClick={() => setAnsweringTo(null)}
                              className="text-gray-500 text-sm hover:underline"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
             ))
          )}
        </div>
      )}
    </div>
  );
};

export default VendorQnA;
