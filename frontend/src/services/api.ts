import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

class ApiService {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: `${API_URL}/api`,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private logoutCallback: (() => void) | null = null;

  public setLogoutCallback(callback: () => void) {
    this.logoutCallback = callback;
  }

  private setupInterceptors() {
    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('token');
          if (this.logoutCallback) {
            this.logoutCallback();
          } else {
            // Fallback if no callback set
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // HTTP methods
  get(url: string, config?: AxiosRequestConfig) {
    return this.axiosInstance.get(url, config);
  }

  post(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.axiosInstance.post(url, data, config);
  }

  put(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.axiosInstance.put(url, data, config);
  }

  delete(url: string, config?: AxiosRequestConfig) {
    return this.axiosInstance.delete(url, config);
  }

  patch(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.axiosInstance.patch(url, data, config);
  }

  // File upload
  uploadFile(url: string, formData: FormData, config?: AxiosRequestConfig) {
    return this.axiosInstance.post(url, formData, {
      ...config,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }
}

export const apiService = new ApiService();
export default apiService;
