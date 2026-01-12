import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { apiService } from '../services/api';
import { Product, Shop } from '../types';
import ProductCard from '../components/common/ProductCard';
import Loader from '../components/common/Loader';
import { Calendar, Package, Star } from 'lucide-react';

const ShopPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchShopData = async () => {
      try {
        setLoading(true);
        if (id) {
            // @ts-ignore - getShopProfile method added but type definition might lag
            const { data } = await apiService.getShopProfile(id);
            setShop(data.vendor);
            setProducts(data.products);
        }
      } catch (err: any) {
        setError(err.response?.data?.msg || 'Failed to load shop');
      } finally {
        setLoading(false);
      }
    };

    fetchShopData();
  }, [id]);

  useEffect(() => {
    if (shop) {
        document.title = `${shop.shopName || shop.name}'s Shop - MERN Ecommerce`;
    }
  }, [shop]);

  if (loading) return <Loader />;
  if (error) return <div className="text-center py-20 text-red-600">{error}</div>;
  if (!shop) return <div className="text-center py-20">Shop not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-12">
      {/* Banner Section */}
      <div 
        className="w-full h-48 md:h-64 bg-gray-300 dark:bg-gray-700 relative bg-cover bg-center"
        style={{ backgroundImage: shop.banner ? `url(${shop.banner})` : 'none' }}
      >
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="container mx-auto px-4 h-full relative">
            <div className="absolute -bottom-12 left-4 md:left-8 flex items-end">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white dark:border-gray-800 bg-white shadow-lg overflow-hidden flex items-center justify-center">
                    {shop.logo ? (
                        <img src={shop.logo} alt={shop.shopName} className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-3xl font-bold text-gray-400">{shop.shopName?.charAt(0) || shop.name.charAt(0)}</span>
                    )}
                </div>
            </div>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-16 md:mt-4">
        <div className="flex flex-col md:flex-row gap-8">
            {/* Shop Info Sidebar */}
            <div className="w-full md:w-1/4">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mt-6 md:mt-0">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{shop.shopName || shop.name}</h1>
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
                        <Calendar size={16} className="mr-1" />
                        <span>Joined {new Date(shop.joinedAt).toLocaleDateString()}</span>
                    </div>
                    
                    {shop.description && (
                         <div className="prose dark:prose-invert text-sm text-gray-600 dark:text-gray-300 mb-6">
                            <p>{shop.description}</p>
                         </div>
                    )}

                    <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
                        <div className="flex items-center justify-between text-gray-600 dark:text-gray-300 mb-2">
                           <span className="flex items-center"><Package size={16} className="mr-2"/> Total Products</span>
                           <span className="font-semibold">{products.length}</span>
                        </div>
                        {/* Placeholder for future ratings */}
                        <div className="flex items-center justify-between text-gray-600 dark:text-gray-300">
                           <span className="flex items-center"><Star size={16} className="mr-2"/> Rating</span>
                           <span className="font-semibold">N/A</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Product Grid */}
            <div className="w-full md:w-3/4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 border-b pb-2 dark:border-gray-700">Shop Products</h2>
                
                {products.length === 0 ? (
                    <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
                        <p className="text-gray-500 dark:text-gray-400">This shop hasn't added any products yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {products.map(product => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default ShopPage;
