import React, { useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Camera, Sparkles, Shirt, Home, Wrench, Loader2, ArrowLeft, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../services/api';
import toast from 'react-hot-toast';

interface ShopLensModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Mode = 'fashion' | 'decor' | 'repair' | 'gift' | null;

interface Recommendation {
  search_keyword: string;
  reason_badge: string;
}

interface AnalysisResult {
  ai_comment: string;
  analysis: string;
  products: any[];
  raw_recommendations?: Recommendation[];
}

const ShopLensModal: React.FC<ShopLensModalProps> = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState<Mode>(null);
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleModeSelect = (selectedMode: Mode) => {
    setMode(selectedMode);
    setResult(null);
    setImage(null);
    setPreview(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const analyzeImage = async () => {
    if (!image || !mode) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('image', image);
    formData.append('mode', mode);

    try {
      let response;
      if (mode === 'gift') {
        const result = await apiService.uploadFile('/gift-scout/analyze', formData);
        const data = result.data;

        setResult({
          ai_comment: data.profile_summary,
          analysis: "Suggested Categories: " + data.gift_categories.join(', '),
          products: data.recommended_products,
          raw_recommendations: []
        });

      } else {
        // Standard ShopLens
        const result = await apiService.uploadFile('/shoplens/analyze', formData);
        setResult(result.data);
      }

    } catch (error: any) {
      console.error('Error analyzing image:', error);
      toast.error(error.response?.data?.message || 'Failed to analyze image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setMode(null);
    setImage(null);
    setPreview(null);
    setResult(null);
  };

  const renderModeSelection = () => (
    <div className="space-y-4">
      {/* Helpful intro text */}
      <div className="text-center mb-4 sm:mb-6">
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
          📸 <span className="font-medium">Upload a photo</span> and let our AI find the perfect products for you!
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
          Skip the endless scrolling — just snap a pic and shop smarter.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        <button
          onClick={() => handleModeSelect('fashion')}
          className="group relative p-3 sm:p-4 bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/10 dark:to-rose-900/10 hover:from-pink-100 hover:to-rose-100 dark:hover:from-pink-900/20 dark:hover:to-rose-900/20 rounded-xl sm:rounded-2xl border border-pink-100 dark:border-pink-900/30 hover:border-pink-200 transition-all text-left shadow-sm hover:shadow-md"
        >
          <div className="bg-white dark:bg-gray-800 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center mb-2 sm:mb-3 shadow-sm group-hover:scale-110 transition-transform">
            <Shirt className="w-4 h-4 sm:w-5 sm:h-5 text-pink-500" />
          </div>
          <h3 className="text-sm sm:text-lg font-bold text-gray-800 dark:text-gray-100 mb-0.5 sm:mb-1">Fashion Stylist</h3>
          <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 line-clamp-2">Upload your photo to find your perfect look.</p>
        </button>

        <button
          onClick={() => handleModeSelect('decor')}
          className="group relative p-3 sm:p-4 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/10 dark:to-blue-900/10 hover:from-indigo-100 hover:to-blue-100 dark:hover:from-indigo-900/20 dark:hover:to-blue-900/20 rounded-xl sm:rounded-2xl border border-indigo-100 dark:border-indigo-900/30 hover:border-indigo-200 transition-all text-left shadow-sm hover:shadow-md"
        >
          <div className="bg-white dark:bg-gray-800 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center mb-2 sm:mb-3 shadow-sm group-hover:scale-110 transition-transform">
            <Home className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500" />
          </div>
          <h3 className="text-sm sm:text-lg font-bold text-gray-800 dark:text-gray-100 mb-0.5 sm:mb-1">Interior Designer</h3>
          <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 line-clamp-2">Upload a photo of your room or house.</p>
        </button>

        <button
          onClick={() => handleModeSelect('repair')}
          className="group relative p-3 sm:p-4 bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-800/30 dark:to-gray-800/30 hover:from-slate-100 hover:to-gray-100 dark:hover:from-slate-800/50 dark:hover:to-gray-800/50 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-slate-300 transition-all text-left shadow-sm hover:shadow-md"
        >
          <div className="bg-white dark:bg-gray-800 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center mb-2 sm:mb-3 shadow-sm group-hover:scale-110 transition-transform">
            <Wrench className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600 dark:text-slate-400" />
          </div>
          <h3 className="text-sm sm:text-lg font-bold text-gray-800 dark:text-gray-100 mb-0.5 sm:mb-1">The Mechanic</h3>
          <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 line-clamp-2">Upload a photo of the broken part or machine.</p>
        </button>

        <button
          onClick={() => handleModeSelect('gift')}
          className="group relative p-3 sm:p-4 bg-gradient-to-br from-purple-50 to-fuchsia-50 dark:from-purple-900/10 dark:to-fuchsia-900/10 hover:from-purple-100 hover:to-fuchsia-100 dark:hover:from-purple-900/20 dark:hover:to-fuchsia-900/20 rounded-xl sm:rounded-2xl border border-purple-100 dark:border-purple-900/30 hover:border-purple-200 transition-all text-left shadow-sm hover:shadow-md"
        >
          <div className="bg-white dark:bg-gray-800 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center mb-2 sm:mb-3 shadow-sm group-hover:scale-110 transition-transform">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
          </div>
          <h3 className="text-sm sm:text-lg font-bold text-gray-800 dark:text-gray-100 mb-0.5 sm:mb-1">Gift Scout</h3>
          <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 line-clamp-2">Upload their social profile/pic to find a gift.</p>
        </button>
      </div>
    </div>
  );

  const renderUploadStep = () => (
    <div className="flex flex-col items-center justify-center h-full space-y-6">

      <div
        onClick={() => fileInputRef.current?.click()}
        className="w-full max-w-md aspect-video rounded-3xl border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 cursor-pointer transition-all flex flex-col items-center justify-center group bg-gray-50 dark:bg-gray-800/50"
      >
        {preview ? (
          <img src={preview} alt="Preview" className="w-full h-full object-contain rounded-3xl p-2" />
        ) : (
          <>
            <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Camera className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-lg font-medium text-gray-700 dark:text-gray-300">Click to upload photo</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">or drag and drop</p>
          </>
        )}
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleImageUpload}
        />
      </div>

      {preview && (
        <button
          onClick={analyzeImage}
          disabled={loading}
          className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full font-bold shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Consulting AI...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Analyze with ShopLens
            </>
          )}
        </button>
      )}
    </div>
  );

  const renderResults = () => {
    if (!result) return null;

    return (
      <div className="h-full overflow-y-auto pr-2 custom-scrollbar">
        <div className="sticky top-0 bg-white dark:bg-gray-900 z-10 pb-4 border-b border-gray-100 dark:border-gray-800 mb-6">
          <button onClick={reset} className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 flex items-center gap-1 mb-4">
            <ArrowLeft className="w-4 h-4" /> Start Over
          </button>

          {/* AI Comment Bubble */}
          <div className="flex gap-4 items-start bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-slate-800 p-6 rounded-2xl border border-blue-100 dark:border-gray-700 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Sparkles className="w-24 h-24 text-blue-600 dark:text-blue-400 rotate-12" />
            </div>

            <div className="bg-white dark:bg-gray-700 p-2 rounded-full shadow-sm shrink-0 z-10">
              <Sparkles className="w-6 h-6 text-blue-600 dark:text-blue-300" />
            </div>
            <div className="z-10">
              <h4 className="font-bold text-blue-900 dark:text-blue-300 mb-2 text-lg">
                {mode === 'fashion' && "Stylist Says:"}
                {mode === 'decor' && "Designer Says:"}
                {mode === 'repair' && "Mechanic Says:"}
                {mode === 'gift' && "Gift Scout Says:"}
              </h4>
              <p className="text-gray-800 dark:text-gray-100 leading-relaxed text-base italic">"{result.ai_comment}"</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 font-medium uppercase tracking-wide opacity-80">{result.analysis}</p>
            </div>
          </div>
        </div>

        <h4 className="font-bold text-xl mb-4 text-gray-900 dark:text-white">Recommended Products</h4>

        {result.products.length === 0 ? (
          <div className="text-center py-10 text-gray-500 dark:text-gray-400">
            <p>No direct matches found, but here are the keywords I generated:</p>
            <div className="flex flex-wrap gap-2 justify-center mt-2">
              {result.raw_recommendations && result.raw_recommendations.map((rec, i) => (
                <span key={i} className="bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full text-sm">{rec.search_keyword}</span>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-10">
            {result.products.map((product) => (
              <div key={product._id} className="group bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-xl transition-all border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col">
                <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-900">
                  {product.images && product.images[0] && (
                    <img src={product.images[0].url} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  )}
                  <div className="absolute top-2 right-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold text-blue-600 dark:text-blue-400 shadow-sm border border-blue-100 dark:border-blue-900">
                    {product.reason_badge}
                  </div>
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <h5 className="font-bold text-gray-900 dark:text-white mb-1 line-clamp-1">{product.name}</h5>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 flex-1 line-clamp-2">{product.description}</p>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="font-bold text-lg dark:text-white">${product.price}</span>
                    <button
                      onClick={() => {
                        onClose();
                        navigate(`/products/${product._id}`);
                      }}
                      className="p-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full hover:bg-blue-600 dark:hover:bg-blue-400 transition-colors"
                    >
                      <Search className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 md:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-4xl h-[95vh] sm:h-[90vh] md:h-[85vh] bg-white dark:bg-gray-900 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col z-10"
          >
            {/* Header */}
            <div className="px-4 sm:px-8 py-3 sm:py-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-white dark:bg-gray-900">
              <div className="flex items-center gap-2 sm:gap-4">
                {mode && !result && (
                  <button
                    onClick={() => setMode(null)}
                    className="p-1.5 sm:p-2 -ml-1 sm:-ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
                    aria-label="Back to modes"
                  >
                    <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                )}

                <div className="flex items-center gap-2">
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-1.5 sm:p-2 rounded-lg sm:rounded-xl text-white">
                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">ShopLens AI</h2>
                    <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 font-medium tracking-wide">VISUAL SHOPPING ASSISTANT</p>
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 p-3 sm:p-6 md:p-8 overflow-hidden bg-white/50 dark:bg-gray-900/50 relative">
              {/* Background Pattern */}
              <div className="absolute inset-0 bg-grid-slate-50 dark:bg-grid-slate-900/50 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.0))] pointer-events-none" />

              <div className="relative h-full z-10">
                {!mode && renderModeSelection()}
                {mode && !result && renderUploadStep()}
                {result && renderResults()}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

export default ShopLensModal;
