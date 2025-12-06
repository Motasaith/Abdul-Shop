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

const vendorService = {
  getVendorStats: async () => {
    const response = await apiService.get<VendorStats>('/orders/vendor/stats');
    return response.data;
  },

  getVendorOrders: async () => {
    const response = await apiService.get('/orders/vendor/list');
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
