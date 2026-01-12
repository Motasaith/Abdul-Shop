import React, { useEffect, useState } from 'react';
import { useAppDispatch } from '../../hooks/redux';
import adminService from '../../services/adminService';
import { toast } from 'react-hot-toast';
import { usePrice } from '../../hooks/usePrice';
import { motion } from 'framer-motion';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';
import DashboardCard from '../../components/admin/DashboardCard';
import AddProductModal from '../../components/admin/AddProductModal';
import { 
  Users, ShoppingBag, CreditCard, DollarSign, TrendingUp, TrendingDown, 
  Activity, Package, Clock, Download
} from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  lostRevenue: number;
  recentOrders: Array<{
    _id: string;
    user: { name: string; email?: string; avatar?: { url: string } };
    totalPrice: number;
    orderStatus: string;
    createdAt: string;
  }>;
  topProducts: Array<{
    _id: string;
    name: string;
    price: number;
    rating: number;
    countInStock: number;
    images?: Array<{ url: string }>;
  }>;
  dailyStats: Array<{
    name: string;
    date: string;
    revenue: number;
    orders: number;
  }>;
  recentActivity: Array<{
    type: 'order' | 'user';
    message: string;
    amount?: number;
    email?: string;
    id: string;
    createdAt: string;
  }>;
}

// Mock data for chart (since backend might not provide daily history yet)


const AdminDashboard: React.FC = () => {
  // Debug log to verify HMR
  console.log('AdminDashboard rendering');
  const { formatPrice } = usePrice();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);

  const handleDownloadReport = () => {
    if (!stats) return;
    
    // Create CSV content from recent orders
    const headers = ['Order ID', 'Customer', 'Date', 'Total', 'Status'];
    const rows = stats.recentOrders.map(order => [
      order._id,
      order.user?.name || 'Deleted User',
      new Date(order.createdAt).toLocaleDateString(),
      order.totalPrice,
      order.orderStatus
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `dashboard_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Report downloaded successfully');
  };

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const data = await adminService.getDashboardStats();
        setStats(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        toast.error('Failed to load dashboard data');
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Processing': return 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/30';
      case 'Shipped': return 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30';
      case 'Delivered': return 'bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30';
      case 'Cancelled': return 'bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-600 dark:text-gray-400 border-gray-500/30';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[80vh]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    { 
      title: 'Total Revenue', 
      value: formatPrice(stats.totalRevenue), 
      icon: DollarSign, 
      color: 'text-green-500', 
      bg: 'bg-green-500/10',
      trend: '+12.5%', 
      trendUp: true 
    },
    { 
      title: 'Active Users', 
      value: stats.totalUsers.toLocaleString(), 
      icon: Users, 
      color: 'text-blue-500', 
      bg: 'bg-blue-500/10',
      trend: '+5.2%', 
      trendUp: true 
    },
    { 
      title: 'Total Orders', 
      value: stats.totalOrders.toLocaleString(), 
      icon: ShoppingBag, 
      color: 'text-purple-500', 
      bg: 'bg-purple-500/10',
      trend: '+8.1%', 
      trendUp: true 
    },
    { 
      title: 'Total Products', 
      value: stats.totalProducts.toLocaleString(), 
      icon: Package, 
      color: 'text-orange-500', 
      bg: 'bg-orange-500/10',
      trend: '0%', 
      trendUp: true 
    },
  ];

  return (
    <div className="space-y-8 p-2 sm:p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
            Dashboard Overview
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Welcome back! Here's what's happening today.
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleDownloadReport}
            className="px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg shadow hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
          >
            Download Report
          </button>
          <button 
            onClick={() => setIsAddProductModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Create Product
          </button>
        </div>
      </div>

      <AddProductModal 
        isOpen={isAddProductModalOpen} 
        onClose={() => setIsAddProductModalOpen(false)} 
        onProductAdded={() => {
           // Refresh dashboard stats
           const fetchDashboardStats = async () => {
              try {
                const data = await adminService.getDashboardStats();
                setStats(data);
              } catch (error) {
                console.error('Error refreshing dashboard stats:', error);
              }
           };
           fetchDashboardStats();
        }} 
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <DashboardCard key={index} delay={index * 0.1}>
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{stat.title}</p>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{stat.value}</h3>
                  <div className={`flex items-center text-xs font-medium ${stat.trendUp ? 'text-green-500' : 'text-red-500'}`}>
                    {stat.trendUp ? <TrendingUp size={14} className="mr-1" /> : <TrendingDown size={14} className="mr-1" />}
                    <span>{stat.trend} from last month</span>
                  </div>
                </div>
                <div className={`p-3 rounded-xl ${stat.bg}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          </DashboardCard>
        ))}
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Chart */}
        <DashboardCard className="lg:col-span-2 p-6" delay={0.4}>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Revenue Analytics</h3>
            <select className="bg-gray-50 dark:bg-gray-700 border-none rounded-lg text-sm px-3 py-1 text-gray-600 dark:text-gray-300 focus:ring-2 focus:ring-blue-500">
              <option>This Week</option>
              <option>Last Month</option>
              <option>Last Year</option>
            </select>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.dailyStats}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" opacity={0.3} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF'}} tickFormatter={(value) => `$${value}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  itemStyle={{ color: '#6B7280' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </DashboardCard>

        {/* Recent Activity */}
        <DashboardCard className="p-6" delay={0.5}>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Recent Activity</h3>
          <div className="space-y-6">
            {stats.recentActivity && stats.recentActivity.length > 0 ? (
              stats.recentActivity.map((activity, index) => (
                <div key={activity.id} className="flex items-center gap-4">
                  <div className={`
                    p-2 rounded-full
                    ${activity.type === 'order' 
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' 
                      : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'}
                  `}>
                    {activity.type === 'order' ? <ShoppingBag className="w-5 h-5" /> : <Users className="w-5 h-5" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.message}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(activity.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {' - '}
                      {new Date(activity.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {activity.amount && (
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      {formatPrice(activity.amount)}
                    </span>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-sm">No recent activity</p>
            )}
          </div>
        </DashboardCard>
      </div>

      {/* Recent Orders & Top Products Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <DashboardCard className="overflow-hidden" delay={0.6}>
          <div className="p-6 border-b border-gray-100 dark:border-gray-700/50 flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recent Orders</h3>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/50 dark:bg-gray-700/30">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                {stats.recentOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${order.user ? 'bg-gradient-to-tr from-blue-500 to-purple-500' : 'bg-gray-400'}`}>
                          {order.user?.name ? order.user.name.charAt(0) : '?'}
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{order.user?.name || 'Deleted User'}</p>
                          <p className="text-xs text-gray-500">{order._id.slice(-6)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900 dark:text-white">{formatPrice(order.totalPrice)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusColor(order.orderStatus)}`}>
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(order.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DashboardCard>

        <DashboardCard className="overflow-hidden" delay={0.7}>
          <div className="p-6 border-b border-gray-100 dark:border-gray-700/50">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Top Selling Products</h3>
          </div>
          <div className="p-6 space-y-6">
            {stats.topProducts.map((product, index) => (
              <div key={product._id} className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-gray-100 dark:bg-gray-700 flex-shrink-0 relative overflow-hidden">
                   {/* Placeholder for product image if not present */}
                   <img 
                      src={product.images?.[0]?.url || `https://ui-avatars.com/api/?name=${product.name}&background=random`} 
                      alt={product.name}
                      className="w-full h-full object-cover"
                   />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">{product.name}</h4>
                  <div className="flex items-center mt-1">
                    <span className="text-xs text-gray-500">{product.countInStock} Left in Stock</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900 dark:text-white">{formatPrice(product.price)}</p>
                  <p className="text-xs text-green-500 font-medium">{product.rating} ★</p>
                </div>
              </div>
            ))}
          </div>
        </DashboardCard>
      </div>
    </div>
  );
};

export default AdminDashboard;
