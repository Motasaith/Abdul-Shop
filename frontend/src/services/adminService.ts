import { apiService } from './api';

const adminService = {
  // Dashboard
  getDashboardStats: async () => {
    const response = await apiService.get('/admin/dashboard');
    return response.data;
  },

  // Products
  getProducts: async (params = {}) => {
    const response = await apiService.get('/admin/products', { params });
    return response.data;
  },

  createProduct: async (productData: any) => {
    const response = await apiService.post('/admin/products', productData);
    return response.data;
  },

  createProductWithFiles: async (formData: FormData) => {
    const response = await apiService.uploadFile('/admin/products', formData);
    return response.data;
  },

  updateProduct: async (id: string, productData: any) => {
    const response = await apiService.put(`/admin/products/${id}`, productData);
    return response.data;
  },

  deleteProduct: async (id: string) => {
    const response = await apiService.delete(`/admin/products/${id}`);
    return response.data;
  },

  // Users
  getUsers: async (params = {}) => {
    const response = await apiService.get('/admin/users', { params });
    return response.data;
  },

  updateUserStatus: async (id: string, isActive: boolean) => {
    const response = await apiService.put(`/admin/users/${id}/status`, { isActive });
    return response.data;
  },

  deleteUser: async (id: string) => {
    const response = await apiService.delete(`/admin/users/${id}`);
    return response.data;
  },

  // Orders
  getOrders: async (params = {}) => {
    const response = await apiService.get('/admin/orders', { params });
    return response.data;
  },

  updateOrderStatus: async (id: string, orderStatus: string) => {
    const response = await apiService.put(`/admin/orders/${id}/status`, { orderStatus });
    return response.data;
  },

  markOrderAsPaid: async (id: string, paymentResult: any) => {
    const response = await apiService.put(`/orders/${id}/pay`, paymentResult);
    return response.data;
  },

  // Coupons
  getAllCoupons: async () => {
    const response = await apiService.get('/coupons');
    return response.data;
  },

  createCoupon: async (couponData: any) => {
    const response = await apiService.post('/coupons', couponData);
    return response.data;
  },

  deleteCoupon: async (id: string) => {
    const response = await apiService.delete(`/coupons/${id}`);
    return response.data;
  },

  // Content (Reviews & QnA)
  // Admin can access all reviews/qna via existing public routes or specialized admin routes if needed.
  // For now, we reuse the vendor logic but fetch ALL products/reviews.
  
  // Actually, we need a way to get ALL reviews/questions cleanly.
  // We can add specific admin endpoints or reuse product fetching.
  // Let's assume we use the product list to aggregate for now, or add specific routes later if performance requires.
  // For MVP, we will fetch all products and extract reviews/qna like we did for vendors, but for ALL products.
  // Content Management
  getPageContent: async (page: string) => {
    const response = await apiService.get(`/content/${page}`);
    return response.data;
  },

  updatePageContent: async (page: string, sections: any) => {
    const response = await apiService.put(`/content/${page}`, { sections });
    return response.data;
  }
};

export default adminService;
