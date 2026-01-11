import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchProducts } from '../store/slices/productSlice';
import { addToCart } from '../store/slices/cartSlice';
import { toast } from 'react-hot-toast';
import { 
  ArrowUpRight, 
  Sparkles,
  Quote
} from 'lucide-react';
import { Star } from 'lucide-react';
import { usePrice } from '../hooks/usePrice';
import { useTranslation } from '../hooks/useTranslation';
import ProductCard from '../components/common/ProductCard';
import { motion, AnimatePresence } from 'framer-motion';

const SlideshowBackground = () => {
  const [index, setIndex] = React.useState(0);
  const images = [
    "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1770&q=80", // Modest fashion/Streetwear
    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1770&q=80", // Store interior
    "https://images.unsplash.com/photo-1555529733-0e670560f7e1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1770&q=80"  // Lifestyle/Product
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <AnimatePresence mode='wait'>
      <motion.img
        key={index}
        src={images[index]}
        initial={{ opacity: 0, scale: 1.1 }}
        animate={{ opacity: 0.6, scale: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1.5 }}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
      />
    </AnimatePresence>
  );
};

const HomePage: React.FC = () => {
  const { formatPrice } = usePrice();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { products, loading } = useAppSelector((state) => state.products);

  useEffect(() => {
    dispatch(fetchProducts({ page: 1, limit: 8 }));
  }, [dispatch]);

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

  // Randomize products on mount to keep the grid fresh
  const [randomizedProducts, setRandomizedProducts] = React.useState<any[]>([]);

  useEffect(() => {
    if (products.length > 0) {
      const shuffled = [...products].sort(() => 0.5 - Math.random());
      setRandomizedProducts(shuffled);
    }
  }, [products]);

  // Use randomized products if available, otherwise fallback to normal order
  const displayProducts = randomizedProducts.length > 0 ? randomizedProducts : products;

  return (
    <div className="bg-[#F2F4F8] dark:bg-gray-900 min-h-screen p-4 md:p-6 lg:p-8 font-sans">
      
       {/* "THE LOOKBOOK" (Slideshow) - Top Banner */}
       <div className="max-w-[1600px] mx-auto mb-8">
        <div className="relative rounded-[48px] overflow-hidden bg-gray-900 h-[400px] group shadow-xl">
            {/* Slideshow Background Component */}
            <SlideshowBackground />

            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent flex items-center pointer-events-none">
                <div className="max-w-2xl px-12 md:px-24 pointer-events-auto">
                    <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold text-white mb-6 uppercase tracking-wider">
                        Season 2024
                    </span>
                    <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
                        The Lookbook. <br/> Define Your Style.
                    </h2>
                    <p className="text-lg text-gray-200 mb-8 leading-relaxed max-w-lg">
                        Explore our curated gallery of seasonal favorites. From street style to elegant evenings, find the look that speaks to you.
                    </p>
                    <Link to="/products" className="px-8 py-4 bg-white text-black rounded-full font-bold hover:bg-blue-500 hover:text-white transition-all transform hover:scale-105 inline-flex items-center gap-2">
                        View Collection
                        <ArrowUpRight className="w-5 h-5" />
                    </Link>
                </div>
            </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-auto">
        
        {/* HERO SECTION - Large Bento Card (2x2) */}
        {displayProducts[0] ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="col-span-1 md:col-span-2 lg:col-span-2 row-span-2 bg-[#F3F5F7] dark:bg-gray-800 rounded-[32px] p-8 md:p-12 relative overflow-hidden group shadow-sm hover:shadow-md transition-shadow"
          >
            {/* Background Blur Blob */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-100/50 to-purple-100/50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

            {/* Text Protection Gradient */}
            <div className="absolute inset-y-0 left-0 w-3/4 bg-gradient-to-r from-[#F3F5F7] via-[#F3F5F7]/95 to-transparent dark:from-gray-800 dark:via-gray-800/95 z-0 pointer-events-none" />
            
            <div className="relative z-10 h-full flex flex-col justify-center max-w-xl pl-4">
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-white dark:bg-gray-700 rounded-full w-fit mb-6 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-300 shadow-sm border border-gray-100 dark:border-gray-600 backdrop-blur-md bg-opacity-80">
                <Sparkles className="w-3 h-3 text-yellow-500" />
                Featured Collection
              </span>
              
              <h1 className="text-4xl md:text-5xl lg:text-7xl font-black tracking-tighter text-gray-900 dark:text-white mb-6 leading-[1] line-clamp-2 drop-shadow-sm">
                {displayProducts[0].name}
              </h1>
              
              <div className="flex items-start gap-4 mb-10">
                <div className="p-3 bg-white/80 dark:bg-gray-700/80 backdrop-blur-md rounded-2xl shadow-sm border border-white/20">
                   <h3 className="font-bold text-xl text-gray-900 dark:text-gray-100">{formatPrice(displayProducts[0].price)}</h3>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-300 text-sm max-w-[250px] leading-relaxed line-clamp-3 mt-1 font-medium backdrop-blur-sm bg-white/30 dark:bg-black/30 p-2 rounded-lg">
                    {displayProducts[0].description}
                  </p>
                </div>
              </div>

              <Link 
                to={`/products/${displayProducts[0]._id}`}
                className="inline-flex items-center gap-2 bg-[#D1E030] hover:bg-[#c2d02b] text-black px-8 py-4 rounded-full font-bold transition-all shadow-xl hover:shadow-[#D1E030]/30 w-fit group/btn z-20"
              >
                Shop Now
                <ArrowUpRight className="w-5 h-5 transition-transform group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1" />
              </Link>
            </div>
            
            <div className="absolute top-0 bottom-0 right-0 w-[55%] pointer-events-none flex items-center justify-end overflow-hidden">
               <img 
                src={displayProducts[0].images?.[0]?.url || 'https://via.placeholder.com/500?text=No+Image'} 
                alt={displayProducts[0].name} 
                className="h-[120%] w-full object-contain object-right-center transform translate-x-10 group-hover:translate-x-5 transition-transform duration-700 drop-shadow-2xl" 
               />
            </div>
          </motion.div>
        ) : (
          <div className="col-span-2 row-span-2 bg-gray-100 dark:bg-gray-800 rounded-[32px] animate-pulse" />
        )}

        {/* NEW ARRIVALS - Small Bento Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-[32px] p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
        >
          <div className="relative z-10">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">New Arrivals</h3>
             <Link to="/products?sort=newest" className="text-sm text-gray-500 flex items-center gap-1 hover:text-blue-600 transition-colors">
               Check them out <ArrowUpRight className="w-3 h-3" />
             </Link>
          </div>
          <div className="absolute right-[-20px] bottom-[-20px] opacity-10 rotate-12">
            <Sparkles className="w-32 h-32" />
          </div>
        </motion.div>

        {/* PRODUCT TILE 2 - Medium Card */}
        {displayProducts[1] && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="col-span-1 row-span-1 bg-white dark:bg-gray-800 rounded-[32px] p-4 relative overflow-hidden group shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start z-10 relative">
              <div className="max-w-[60%]">
                <h3 className="text-md font-bold text-gray-900 dark:text-white leading-tight mb-1 line-clamp-1">{displayProducts[1].name}</h3>
                <p className="text-sm text-gray-500">{formatPrice(displayProducts[1].price)}</p>
              </div>
              <Link to={`/products/${displayProducts[1]._id}`} className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors">
                 <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
            <img 
              src={displayProducts[1].images?.[0]?.url || 'https://via.placeholder.com/200'} 
              alt={displayProducts[1].name} 
              className="absolute bottom-0 right-0 w-32 h-32 object-cover rounded-tl-[32px] shadow-sm transform translate-y-2 translate-x-2 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform"
            />
          </motion.div>
        )}

        {/* TALL CARD - Product 3 */}
        {displayProducts[2] && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="col-span-1 row-span-2 bg-gray-900 rounded-[32px] overflow-hidden relative group shadow-sm hover:shadow-md transition-shadow"
          >
             <img 
               src={displayProducts[2].images?.[0]?.url || 'https://via.placeholder.com/400x600'} 
               alt={displayProducts[2].name}
               className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-60 transition-opacity duration-500"
             />
             <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent p-6 flex flex-col justify-end">
                <span className="inline-block px-2 py-1 bg-white/20 backdrop-blur-md rounded-md text-[10px] font-bold text-white mb-2 w-fit">
                  TRENDING
                </span>
                <h3 className="text-xl font-bold text-white mb-1 line-clamp-2 leading-tight">{displayProducts[2].name}</h3>
                <div className="flex items-center justify-between mt-2">
                   <p className="text-white font-bold">{formatPrice(displayProducts[2].price)}</p>
                   <Link to={`/products/${displayProducts[2]._id}`} className="w-8 h-8 bg-white text-black rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                     <ArrowUpRight className="w-4 h-4" />
                   </Link>
                </div>
             </div>
          </motion.div>
        )}
        
        {/* NEW CREATIVE TILE - Filling the Gap */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-orange-500 rounded-[32px] p-6 flex flex-col items-start justify-between shadow-lg hover:shadow-xl transition-shadow relative overflow-hidden group text-white"
        >
           <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
           
           <div>
             <span className="bg-white/20 text-xs font-bold px-2 py-1 rounded-md backdrop-blur-sm">Limited Offer</span>
             <h3 className="text-2xl font-bold mt-2 leading-tight">Save 20%</h3>
             <p className="text-orange-100 text-sm mt-1">On selected electronics</p>
           </div>
           
           <Link to="/products?category=electronics" className="w-full py-2 bg-white text-orange-600 rounded-xl text-center font-bold text-sm mt-4 hover:bg-orange-50 transition-colors">
             Grab it now
           </Link>
        </motion.div>

        {/* DISCOVER MORE - Wide Card (Restored to Transparent Collage - 3 Images) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="col-span-1 md:col-span-2 bg-[#1A1A1A] text-white rounded-[32px] p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between relative overflow-hidden"
        >
          {/* Recent Products Three Column Fade */}
          <div className="absolute right-0 top-0 h-full w-2/3 pointer-events-none fade-mask-l">
             <div className="grid grid-cols-3 gap-3 p-4 h-full items-center">
                {(displayProducts.length > 4 ? displayProducts.slice(4, 7) : displayProducts.slice(0, 3)).map((p, ix) => (
                  <div key={ix} className="rounded-xl overflow-hidden bg-white/10 aspect-square border border-white/20 transform rotate-2 hover:rotate-0 transition-transform duration-500">
                    <img src={p.images?.[0]?.url || 'https://via.placeholder.com/150'} className="w-full h-full object-cover" alt={p.name} />
                  </div>
                ))}
             </div>
          </div>

          <div className="relative z-10 max-w-[50%]">
            <h3 className="text-2xl font-bold mb-2">Discover More.</h3>
            <p className="text-gray-400 text-sm mb-6">Browse our latest additions and curated collections just for you.</p>
            <Link to="/products" className="inline-flex items-center gap-2 bg-white text-black px-5 py-2.5 rounded-full text-sm font-bold hover:bg-gray-200 transition-colors">
              View Collection
            </Link>
          </div>
        </motion.div>

        {/* CUSTOM CREATIVE TILE - Quality */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-indigo-600 rounded-[32px] p-6 flex flex-col items-center justify-center text-center shadow-lg hover:shadow-xl transition-shadow relative overflow-hidden group"
        >
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
           <Star className="w-8 h-8 text-yellow-300 mb-3 fill-current rotate-12 group-hover:rotate-45 transition-transform" />
           <h3 className="text-white font-bold text-lg leading-tight mb-1">Quality <br/> Guaranteed</h3>
           <p className="text-indigo-200 text-xs">Premium products only.</p>
        </motion.div>

        {/* PRODUCT TILE 4 - Medium Card (Replaces Release Card) */}
        {displayProducts[3] && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="col-span-1 md:col-span-2 bg-white dark:bg-gray-800 rounded-[32px] p-6 flex items-center justify-between relative overflow-hidden group shadow-sm hover:shadow-md transition-shadow"
          >
             <div className="relative z-10 max-w-[50%] h-full flex flex-col justify-center">
               <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 leading-tight line-clamp-2">
                 {displayProducts[3].name}
               </h3>
               <p className="text-sm text-gray-500 mb-4 line-clamp-2">{displayProducts[3].description}</p>
               <span className="text-lg font-bold text-gray-900 dark:text-white">{formatPrice(displayProducts[3].price)}</span>
             </div>
             
             <div className="absolute right-4 top-4 bottom-4 w-[45%] rounded-2xl overflow-hidden">
                <img 
                  src={displayProducts[3].images?.[0]?.url || 'https://via.placeholder.com/400'} 
                  alt={displayProducts[3].name} 
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                />
             </div>
             <Link to={`/products/${displayProducts[3]._id}`} className="absolute bottom-6 left-6 w-10 h-10 border border-gray-200 dark:border-gray-700 rounded-full flex items-center justify-center text-gray-900 dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors">
                <ArrowUpRight className="w-5 h-5" />
             </Link>
          </motion.div>
        )}

      </div>


      
      {/* Featured Products Grid - Keeping your requested product cards below */}
      <div className="max-w-[1600px] mx-auto mt-12">
        <h2 className="text-2xl font-bold mb-6 px-2 text-gray-900 dark:text-white">Trending Now</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayProducts.slice(0, 4).map((product: any, index: number) => (
              <motion.div 
                key={product._id} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <ProductCard 
                  product={product} 
                  onAddToCart={() => handleAddToCart(product)}
                />
              </motion.div>
            ))}
        </div>
      </div>

      {/* TESTIMONIALS SECTION - "Voices of Satisfaction" */}
      <div className="max-w-[1600px] mx-auto mt-24 mb-16">
        <div className="flex items-center justify-between mb-10 px-2">
            <div>
              <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Voices of Satisfaction.</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-2">Trusted by over 50,000 customers worldwide.</p>
            </div>
            {/* Decorative Stars */}
            <div className="hidden md:flex gap-1">
                {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-500 fill-current" />
                ))}
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
                {
                    name: "Sarah Jenkins",
                    role: "Fashion Enthusiast",
                    text: "Absolutely in love with the quality! The fabric feels premium and the fit is just perfect. Will definitely buy again.",
                    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                },
                {
                    name: "Michael Chen",
                    role: "Tech Reviewer",
                    text: "Fastest shipping I've ever experienced. The product arrived in pristine condition and works like a charm. 5 stars!",
                    image: "https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                },
                {
                    name: "Emma Wilson",
                    role: "Interior Designer",
                    text: "The customer service team went above and beyond to help me with my order. Truly a brand that cares about its people.",
                    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                }
            ].map((testimonial, idx) => (
                <div key={idx} className="bg-white dark:bg-gray-800 p-8 rounded-[32px] shadow-sm hover:shadow-lg transition-shadow relative">
                    <Quote className="w-10 h-10 text-blue-100 dark:text-blue-900 absolute top-8 right-8" />
                    <div className="flex items-center gap-4 mb-6">
                        <img src={testimonial.image} alt={testimonial.name} className="w-14 h-14 rounded-full object-cover border-2 border-white dark:border-gray-700 shadow-sm" />
                        <div>
                            <h4 className="font-bold text-gray-900 dark:text-white">{testimonial.name}</h4>
                            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">{testimonial.role}</p>
                        </div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed relative z-10">
                        "{testimonial.text}"
                    </p>
                </div>
            ))}
        </div>
      </div>

      {/* BRAND STORY SECTION - "The Craft" (Restored to Bottom) */}
      <div className="max-w-[1600px] mx-auto mb-24">
        <div className="relative rounded-[48px] overflow-hidden bg-gray-900 h-[500px] group">
            <img 
                src="https://images.unsplash.com/photo-1556905055-8f358a7a47b2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1770&q=80" 
                alt="Brand Story" 
                className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-1000"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent flex items-center">
                <div className="max-w-2xl px-12 md:px-24">
                    <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold text-white mb-6 uppercase tracking-wider">
                        Our Mission
                    </span>
                    <h2 className="text-5xl md:text-6xl font-black text-white mb-6 leading-tight">
                        Crafting Excellence <br/> Since 2024.
                    </h2>
                    <p className="text-xl text-gray-300 mb-10 leading-relaxed">
                        We believe in quality that speaks for itself. Every product in our collection is handpicked, tested, and curated to ensure it adds genuine value to your life.
                    </p>
                    <Link to="/about" className="px-8 py-4 bg-white text-black rounded-full font-bold hover:bg-blue-500 hover:text-white transition-all transform hover:scale-105 inline-flex items-center gap-2">
                        Read our Story
                        <ArrowUpRight className="w-5 h-5" />
                    </Link>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
