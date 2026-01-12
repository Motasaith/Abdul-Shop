import { apiService } from './api';

export interface VendorStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  walletBalance: number;
  recentOrders: Array<{
    _id: string;
    user: { name: string };
    totalPrice: number;
    orderStatus: string;
    createdAt: string;
  }>;
}

export interface VendorAnalyticsData {
  totalRevenue: number;
  totalSales: number;
  salesGraph: Array<{
    date: string;
    revenue: number;
    sales: number;
  }>;
  topProducts: Array<{
    id: string;
    name: string;
    sold: number;
    revenue: number;
  }>;
}

const vendorService = {
  getVendorStats: async () => {
    // Note: detailed implementation of this endpoint in backend/routes/orders.js seemed missing for vendor specific stats
    // But assuming it returns basic stats like wallet balance
    const response = await apiService.get<VendorStats>('/orders/vendor/stats');
    return response.data;
  },

  getVendorAnalytics: async (timeRange: string = '30days') => {
    const response = await apiService.get(`/vendor/analytics?timeRange=${timeRange}`);
    return response.data;
  },

  getVendorOrders: async () => {
    const response = await apiService.get('/orders/vendor/list');
    return response.data;
  },

  updateVendorProfile: async (data: any) => {
    const response = await apiService.put('/vendor/profile', data);
    return response.data;
  },
  
  // Withdraw request placeholder
  requestPayout: async (amount: number) => {
    // This endpoint doesn't exist yet, but adding method for future
    // const response = await apiService.post('/vendor/payout', { amount });
    // return response.data;
    return new Promise(resolve => setTimeout(resolve, 1000));
  }
};

export default vendorService;
