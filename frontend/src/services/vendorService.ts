import { apiService } from './api';

export interface VendorStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  walletBalance: number;
  commissionRate?: number;
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

export interface Coupon {
  _id: string;
  code: string;
  discountPercentage: number;
  active: boolean;
  startDate: string;
  expiryDate: string;
  usageLimit?: number;
  usedCount: number;
  minPurchaseAmount?: number;
  isGlobal?: boolean;
}

export interface CreateCouponData {
  code: string;
  discountPercentage: number;
  startDate: string;
  expiryDate: string;
  usageLimit?: number;
  minPurchaseAmount?: number;
  applicableProducts?: string[];
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
  },

  // Coupons
  getCoupons: async () => {
    const response = await apiService.get<Coupon[]>('/coupons/my');
    return response.data;
  },

  createCoupon: async (data: CreateCouponData) => {
    const response = await apiService.post<Coupon>('/coupons', data);
    return response.data;
  },

  deleteCoupon: async (id: string) => {
    const response = await apiService.delete(`/coupons/${id}`);
    return response.data;
  },

  // Interactions
  replyToReview: async (productId: string, reviewId: string, comment: string) => {
    const response = await apiService.put(`/products/${productId}/reviews/${reviewId}/reply`, { comment });
    return response.data;
  },

  answerQuestion: async (productId: string, questionId: string, answer: string) => {
    const response = await apiService.put(`/products/${productId}/questions/${questionId}/answer`, { answer });
    return response.data;
  }
};

export default vendorService;
