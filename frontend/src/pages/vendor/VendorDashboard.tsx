import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import vendorService, { VendorStats, VendorAnalyticsData } from '../../services/vendorService';
import productService from '../../services/productService';
import { Product } from '../../types';
import { toast } from 'react-hot-toast';
import { usePrice } from '../../hooks/usePrice';
import { Link } from 'react-router-dom';
import Modal from '../../components/common/Modal';
import AddProductModal from '../../components/admin/AddProductModal';
import CurrencySelector from '../../components/common/CurrencySelector';
import { useTranslation } from '../../hooks/useTranslation';

const VendorDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { formatPrice } = usePrice();
  const [stats, setStats] = useState<VendorStats | null>(null);
  const [analytics, setAnalytics] = useState<VendorAnalyticsData | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [withdrawing, setWithdrawing] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const { user } = useAppSelector((state) => state.auth);

  const fetchData = async () => {
    try {
      const [statsData, productsResponse, analyticsData] = await Promise.all([
        vendorService.getVendorStats(),
        productService.getVendorProducts(),
        vendorService.getVendorAnalytics('30days')
      ]);
      
      setStats(statsData);
      setProducts(productsResponse.data);
      setAnalytics(analyticsData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleProductAdded = () => {
    fetchData();
  };

  const handleWithdraw = async () => {
    if (!stats || stats.walletBalance <= 0) {
      toast.error('No funds available for withdrawal');
      return;
    }
    
    setWithdrawing(true);
    setWithdrawing(true);
    try {
      await vendorService.requestPayout(stats.walletBalance);
      toast.success(t('vendor.payoutSuccess', { defaultValue: 'Payout requested successfully!' }));
      // Refresh stats?
    } catch (error) {
       toast.error(t('vendor.payoutError', { defaultValue: 'Failed to request payout' }));
    } finally {
      setWithdrawing(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Processing': return 'bg-yellow-100 text-yellow-800';
      case 'Shipped': return 'bg-blue-100 text-blue-800';
      case 'Delivered': return 'bg-green-100 text-green-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDeleteClick = (id: string) => {
    setProductToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (productToDelete) {
      try {
        await productService.deleteProduct(productToDelete);
        toast.success(t('vendor.deleteSuccess', { defaultValue: 'Product deleted successfully' }));
        // Refresh list
        const productsResponse = await productService.getVendorProducts();
        setProducts(productsResponse.data);
         // Refresh stats as well to update counts
        const statsData = await vendorService.getVendorStats();
        setStats(statsData);
      } catch (error) {
        console.error('Error deleting product:', error);
        toast.error(t('vendor.deleteError', { defaultValue: 'Failed to delete product' }));
      } finally {
        setIsDeleteModalOpen(false);
        setProductToDelete(null);
      }
    }
  };

  if (user?.vendorStatus === 'pending') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-8 rounded-lg shadow-sm max-w-2xl">
          <div className="flex justify-center mb-4">
            <svg className="h-16 w-16 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('vendor.applicationPending.title')}</h2>
          <p className="text-gray-600 mb-6">
            {t('vendor.applicationPending.message')}
          </p>
          <div className="text-sm text-gray-500">
            {t('vendor.applicationPending.contactSupport')} <Link to="/contact" className="text-blue-600 hover:text-blue-800 underline">support</Link>.
          </div>
        </div>
      </div>
    );
  }

  if (user?.vendorStatus === 'rejected') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
        <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-400 p-8 rounded-lg shadow-sm max-w-2xl">
          <div className="flex justify-center mb-4">
             <svg className="h-16 w-16 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('vendor.applicationRejected.title')}</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {t('vendor.applicationRejected.message')}
          </p>
          <div className="text-sm text-gray-500 dark:text-gray-400">
             {t('vendor.applicationRejected.contactSupport')} <Link to="/contact" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline">support</Link> for more details.
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Error loading dashboard data
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{t('vendor.dashboard')}</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
            {t('vendor.shop')}: <span className="font-semibold text-blue-600 dark:text-blue-400">{user?.vendorDetails?.shopName || 'My Shop'}</span>
            <Link 
              to={`/shop/${user?._id || user?.id}`}
              className="ml-4 text-sm text-blue-600 hover:text-blue-800 underline"
            >
              {t('vendor.viewLiveShop')}
            </Link>
          </p>
        </div>
        <div className="flex items-center gap-3">
           <Link
             to="/vendor/settings"
             className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
             title={t('vendor.settings', { defaultValue: "Settings" })}
           >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
           </Link>
           <CurrencySelector variant="header" />
           <button 
             onClick={() => setIsAddProductModalOpen(true)}
             className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
           >
             + {t('vendor.addNewProduct')}
           </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Wallet Balance */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow-md p-4 sm:p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-blue-100 text-sm font-medium">Wallet Balance</p>
              <h3 className="text-3xl font-bold mt-1">{formatPrice(stats.walletBalance)}</h3>
              <p className="text-xs text-blue-100 mt-1 opacity-80">
                * Net earnings after {stats.commissionRate || 0}% platform tax (Admin Commission)
              </p>
            </div>
            <div className="p-2 bg-white/20 rounded-lg">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
               </svg>
            </div>
          </div>
          <button 
            onClick={handleWithdraw}
            disabled={withdrawing || stats.walletBalance <= 0}
            className="mt-4 w-full bg-white/20 hover:bg-white/30 text-white text-sm font-medium py-2 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {withdrawing ? t('vendor.processing') : t('vendor.withdrawFunds')}
          </button>
        </div>

        {/* Total Revenue */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 transition-colors duration-300">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('vendor.totalEarnings')}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatPrice(stats.totalRevenue)}</p>
            </div>
          </div>
        </div>

        {/* Total Products */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 transition-colors duration-300">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('vendor.myProducts')}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalProducts}</p>
            </div>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 transition-colors duration-300">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('vendor.totalOrders')}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalOrders}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Section */}
      {analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sales Chart */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors duration-300">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Sales Overview (Last 30 Days)</h3>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.salesGraph} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                  <XAxis 
                    dataKey="date" 
                    className="text-xs text-gray-500" 
                    tickFormatter={(value) => new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  />
                  <YAxis className="text-xs text-gray-500" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                    formatter={(value: any) => [`$${value}`, 'Revenue']}
                    labelFormatter={(label) => new Date(label).toLocaleDateString()}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#3B82F6" 
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Selling Products */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors duration-300">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Selling Products</h3>
            <div className="space-y-4">
              {analytics.topProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex-1 min-w-0 mr-4">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {product.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {product.sold} sold
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      {formatPrice(product.revenue)}
                    </p>
                  </div>
                </div>
              ))}
              {analytics.topProducts.length === 0 && (
                <p className="text-gray-500 text-sm text-center py-4">No sales data yet.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* My Listed Products */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-colors duration-300">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('vendor.myListedProducts')}</h3>
          <Link to="/products/new" className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
            {t('vendor.viewAllManaged')}
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('vendor.product')}</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('vendor.price')}</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('vendor.stock')}</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('vendor.status')}</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('vendor.actions')}</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {products.length > 0 ? (
                products.slice(0, 5).map((product) => (
                  <tr key={product._id}>
                     <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img className="h-10 w-10 rounded-full object-cover" src={product.images[0]?.url || 'https://via.placeholder.com/40'} alt="" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[200px]">{product.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{product.category}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatPrice(product.price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {product.countInStock}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        product.countInStock > 0 ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200' : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                      }`}>
                        {product.countInStock > 0 ? t('vendor.inStock') : t('vendor.outOfStock')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link to={`/products/edit/${product._id}`} className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 mr-4">{t('vendor.edit')}</Link>
                      <button 
                        onClick={() => handleDeleteClick(product._id)}
                        className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 mr-4"
                      >
                        {t('vendor.delete')}
                      </button>
                      <Link to={`/products/${product._id}`} className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300">{t('vendor.view')}</Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                    {t('vendor.noProductsFound')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-colors duration-300">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('vendor.recentOrders')}</h3>
          <Link to="/vendor/orders" className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
            View All Orders
          </Link>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {stats.recentOrders.length > 0 ? (
            stats.recentOrders.map((order) => (
              <div key={order._id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{order.user?.name || t('vendor.unknownUser')}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t('vendor.order')} #{order._id.slice(-8)}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{formatPrice(order.totalPrice)}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(order.createdAt)}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.orderStatus)}`}>
                      {order.orderStatus}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
              {t('vendor.noOrdersYet')}
            </div>
          )}
        </div>
      </div>
      
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title={t('vendor.deleteModal.title')}
        actionButton={
          <button
            onClick={confirmDelete}
            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
          >
            {t('vendor.deleteModal.confirm')}
          </button>
        }
      >
        <div className="mt-2">
          <p className="text-sm text-gray-500">
            {t('vendor.deleteModal.message')}
          </p>
        </div>
      </Modal>

      <AddProductModal 
        isOpen={isAddProductModalOpen}
        onClose={() => setIsAddProductModalOpen(false)}
        onProductAdded={handleProductAdded}
        service={productService}
      />
    </div>
  );
};

export default VendorDashboard;
