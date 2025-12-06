import apiService from './api';

interface Notification {
  _id: string;
  type: 'order' | 'user' | 'stock' | 'system' | 'newsletter';
  message: string;
  read: boolean;
  data: any;
  createdAt: string;
}

interface NotificationResponse {
  notifications: Notification[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalNotifications: number;
    hasMore: boolean;
  };
  unreadCount: number;
}

const getNotifications = async (page = 1, limit = 20): Promise<NotificationResponse> => {
  const response = await apiService.get(`/notifications?page=${page}&limit=${limit}`);
  return response.data;
};

const markAsRead = async (id: string): Promise<Notification> => {
  const response = await apiService.put(`/notifications/${id}/read`);
  return response.data;
};

const markAllAsRead = async (): Promise<{ msg: string }> => {
  const response = await apiService.put(`/notifications/mark-all-read`);
  return response.data;
};

const deleteNotification = async (id: string): Promise<{ msg: string }> => {
  const response = await apiService.delete(`/notifications/${id}`);
  return response.data;
};

const notificationService = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification
};

export default notificationService;
