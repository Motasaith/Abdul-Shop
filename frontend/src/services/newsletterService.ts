import { apiService } from './api';

interface NewsletterSubscriptionData {
  email: string;
  source?: 'homepage' | 'footer' | 'checkout' | 'profile';
}

interface NewsletterResponse {
  success: boolean;
  message: string;
}

interface NewsletterStats {
  overview: {
    total: number;
    active: number;
    inactive: number;
    recentSubscriptions: number;
  };
  sourceBreakdown: Array<{
    _id: string;
    count: number;
  }>;
  monthlyTrend: Array<{
    _id: {
      year: number;
      month: number;
    };
    count: number;
  }>;
}

interface NewsletterSubscriber {
  _id: string;
  email: string;
  isActive: boolean;
  subscriptionSource: string;
  subscribedAt: string;
  unsubscribedAt?: string;
  preferences: {
    productUpdates: boolean;
    promotions: boolean;
    newArrivals: boolean;
  };
  emailsSent: number;
  lastEmailSent?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface NewsletterSubscribersResponse {
  subscribers: NewsletterSubscriber[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalSubscribers: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  stats: {
    active: number;
    inactive: number;
    total: number;
  };
}

class NewsletterService {
  // Public API - Subscribe to newsletter
  async subscribe(data: NewsletterSubscriptionData): Promise<NewsletterResponse> {
    try {
      const response = await apiService.post('/newsletter/subscribe', data);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        error.response?.data?.errors?.[0]?.msg || 
        'Failed to subscribe to newsletter'
      );
    }
  }

  // Admin API - Send newsletter to subscribers
  async sendNewsletter(data: { subject: string; content: string; filter: string }): Promise<{ success: boolean; message: string; stats: any }> {
    try {
      const response = await apiService.post('/newsletter/admin/send', data);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        'Failed to send newsletter'
      );
    }
  }

  // Public API - Unsubscribe from newsletter
  async unsubscribe(token: string): Promise<NewsletterResponse> {
    try {
      const response = await apiService.post('/newsletter/unsubscribe', { token });
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        'Failed to unsubscribe from newsletter'
      );
    }
  }

  // Admin API - Get newsletter statistics
  async getStats(): Promise<NewsletterStats> {
    try {
      const response = await apiService.get('/newsletter/admin/stats');
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        'Failed to fetch newsletter statistics'
      );
    }
  }

  // Admin API - Get newsletter subscribers
  async getSubscribers(
    page: number = 1, 
    limit: number = 10, 
    search: string = '', 
    status: string = 'all',
    source: string = 'all'
  ): Promise<NewsletterSubscribersResponse> {
    try {
      const response = await apiService.get('/newsletter/admin/subscribers', {
        params: { page, limit, search, status, source }
      });
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        'Failed to fetch newsletter subscribers'
      );
    }
  }

  // Admin API - Delete subscriber
  async deleteSubscriber(id: string): Promise<{ message: string }> {
    try {
      const response = await apiService.delete(`/newsletter/admin/subscribers/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        'Failed to delete subscriber'
      );
    }
  }

  // Admin API - Update subscriber status
  async updateSubscriberStatus(id: string, isActive: boolean): Promise<NewsletterSubscriber> {
    try {
      const response = await apiService.put(
        `/newsletter/admin/subscribers/${id}/status`, 
        { isActive }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        'Failed to update subscriber status'
      );
    }
  }
}

export default new NewsletterService();
