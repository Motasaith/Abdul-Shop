import { apiService } from './api';
import { Order } from '../types';

class OrderService {
  // Create new order
  async createOrder(orderData: any) {
    return apiService.post('/orders', orderData);
  }

  // Get user orders
  async getOrders() {
    return apiService.get('/orders');
  }

  // Get single order
  async getOrder(id: string) {
    return apiService.get(`/orders/${id}`);
  }

  // Update order to paid
  async updateOrderToPaid(id: string, paymentResult: any) {
    return apiService.put(`/orders/${id}/pay`, paymentResult);
  }

  // Update order to delivered (admin only)
  async updateOrderToDelivered(id: string) {
    return apiService.put(`/orders/${id}/deliver`);
  }

  // Get all orders (admin only)
  async getAllOrders() {
    return apiService.get('/orders/admin/all');
  }

  // Update order status (admin only)
  async updateOrderStatus(id: string, status: string) {
    return apiService.put(`/orders/${id}/status`, { status });
  }

  // Cancel order
  async cancelOrder(id: string) {
    return apiService.put(`/orders/${id}/cancel`);
  }

  // Track order by tracking number
  async trackOrder(trackingNumber: string) {
    return apiService.get(`/orders/track/${trackingNumber}`);
  }

  // Track order by order ID and email
  async trackOrderById(orderId: string, email: string) {
    return apiService.post('/orders/track-by-order', { orderId, email });
  }

  // Get order statistics (admin only)
  async getOrderStats(timeRange: string = '7days') {
    return apiService.get(`/orders/stats?timeRange=${timeRange}`);
  }
}

export const orderService = new OrderService();
export default orderService;
