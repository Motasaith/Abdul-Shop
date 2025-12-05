import axios from 'axios';

const API_URL = '/api/notifications';

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
  const response = await axios.get(`${API_URL}?page=${page}&limit=${limit}`);
  return response.data;
};

const markAsRead = async (id: string): Promise<Notification> => {
  const response = await axios.put(`${API_URL}/${id}/read`);
  return response.data;
};

const markAllAsRead = async (): Promise<{ msg: string }> => {
  const response = await axios.put(`${API_URL}/mark-all-read`);
  return response.data;
};

const deleteNotification = async (id: string): Promise<{ msg: string }> => {
  const response = await axios.delete(`${API_URL}/${id}`);
  return response.data;
};

const notificationService = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification
};

export default notificationService;
