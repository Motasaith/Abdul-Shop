import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { orderService } from '../../services/orderService';
import { usePrice } from '../../hooks/usePrice';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingBag,
  Users,
  Activity,
  Calendar,
  Package,
  ArrowRight
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';

interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  totalUsers: number;
  averageOrderValue: number;
  revenueGrowth: number;
  ordersGrowth: number;
  usersGrowth: number;
  conversionRate: number;
  salesTrend: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
  topProducts: Array<{
    id: string;
    name: string;
    sales: number;
    revenue: number;
    image?: string;
  }>;
  recentActivity: Array<{
    id: string;
    type: 'order' | 'user' | 'product';
    message: string;
    timestamp: string;
  }>;
}

const AdminAnalytics: React.FC = () => {
  const { formatPrice } = usePrice();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7days');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await orderService.getOrderStats(timeRange);
      setAnalytics(response.data);
    } catch (error: any) {
      toast.error('Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', { notation: "compact", compactDisplay: "short" }).format(num);
  };

  const getGrowthColor = (growth: number) => {
    if (growth > 0) return 'text-green-500';
    if (growth < 0) return 'text-red-500';
    return 'text-gray-500';
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
            Analytics Overview
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track your business performance and growth
          </p>
        </div>
        
        <div className="flex items-center gap-2 bg-white dark:bg-gray-800 p-1 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          {['7days', '30days', '90days', '1year'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                timeRange === range
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {range === '7days' ? '7D' : range === '30days' ? '30D' : range === '90days' ? '3M' : '1Y'}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {/* Total Revenue */}
        <motion.div variants={itemVariants} className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl p-6 rounded-2xl border border-white/20 dark:border-gray-700 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400">
              <DollarSign className="w-6 h-6" />
            </div>
            <div className={`flex items-center gap-1 text-sm font-medium ${getGrowthColor(analytics.revenueGrowth)} bg-white/80 dark:bg-gray-800/80 px-2 py-1 rounded-lg`}>
              {analytics.revenueGrowth >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {Math.abs(analytics.revenueGrowth)}%
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {formatPrice(analytics.totalRevenue)}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Revenue</p>
        </motion.div>

        {/* Total Orders */}
        <motion.div variants={itemVariants} className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl p-6 rounded-2xl border border-white/20 dark:border-gray-700 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl text-purple-600 dark:text-purple-400">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div className={`flex items-center gap-1 text-sm font-medium ${getGrowthColor(analytics.ordersGrowth)} bg-white/80 dark:bg-gray-800/80 px-2 py-1 rounded-lg`}>
              {analytics.ordersGrowth >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {Math.abs(analytics.ordersGrowth)}%
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {formatNumber(analytics.totalOrders)}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Orders</p>
        </motion.div>

        {/* Total Users */}
        <motion.div variants={itemVariants} className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl p-6 rounded-2xl border border-white/20 dark:border-gray-700 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl text-green-600 dark:text-green-400">
              <Users className="w-6 h-6" />
            </div>
            <div className={`flex items-center gap-1 text-sm font-medium ${getGrowthColor(analytics.usersGrowth)} bg-white/80 dark:bg-gray-800/80 px-2 py-1 rounded-lg`}>
              {analytics.usersGrowth >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {Math.abs(analytics.usersGrowth)}%
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {formatNumber(analytics.totalUsers)}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Users</p>
        </motion.div>

        {/* Avg Order Value */}
        <motion.div variants={itemVariants} className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl p-6 rounded-2xl border border-white/20 dark:border-gray-700 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl text-orange-600 dark:text-orange-400">
              <Activity className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-1 text-sm font-medium text-gray-500 bg-white/80 dark:bg-gray-800/80 px-2 py-1 rounded-lg">
               {analytics.conversionRate}% Conv.
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {formatPrice(analytics.averageOrderValue)}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Avg. Order Value</p>
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sales Chart */}
        <div className="lg:col-span-2 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-6 rounded-2xl border border-white/20 dark:border-gray-700 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Revenue Trend</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.salesTrend}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB60" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                  dy={10}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                  tickFormatter={(value) => `$${value}`}
                  dx={-10}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--tooltip-bg)', 
                    borderColor: 'var(--tooltip-border)',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' 
                  }}
                  itemStyle={{ color: 'var(--tooltip-text)' }}
                  formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'Revenue']}
                  labelFormatter={(label) => new Date(label).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-6 rounded-2xl border border-white/20 dark:border-gray-700 shadow-sm flex flex-col">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Top Products</h3>
          <div className="flex-1 overflow-y-auto pr-2 space-y-4 max-h-[320px] custom-scrollbar">
            {analytics.topProducts.map((product, index) => (
              <div key={product.id} className="flex items-center gap-4 group">
                <div className="h-12 w-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center relative overflow-hidden">
                  {product.image ? (
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <Package className="w-6 h-6 text-gray-400" />
                  )}
                  <div className="absolute top-0 left-0 bg-blue-600 text-[10px] text-white font-bold px-1.5 py-0.5 rounded-br-lg">
                    #{index + 1}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate" title={product.name}>
                    {product.name}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {product.sales} sales
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    {formatPrice(product.revenue)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-6 rounded-2xl border border-white/20 dark:border-gray-700 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Recent Activity</h3>
        <div className="space-y-6 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100 dark:before:bg-gray-800">
          {analytics.recentActivity.map((activity) => (
            <div key={activity.id} className="relative flex gap-4 pl-10 group">
              <div className={`absolute left-[0.65rem] top-1 w-3 h-3 rounded-full border-2 border-white dark:border-gray-900 z-10 ${
                activity.type === 'order' ? 'bg-green-500' :
                activity.type === 'user' ? 'bg-blue-500' : 'bg-purple-500'
              }`} />
              
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {activity.message}
                  </p>
                  <span className="text-xs text-gray-400 whitespace-nowrap">
                    {activity.timestamp}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
