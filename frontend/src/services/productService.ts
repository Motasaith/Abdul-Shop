import { apiService } from './api';
import { Product, FilterOptions } from '../types';

class ProductService {
  // Get all products (alias for backward compatibility)
  async getAllProducts(filters?: any) {
    if (filters) {
      return this.getProducts({ filters });
    }
    return this.getProducts();
  }

  // Get all products with pagination and filters
  async getProducts(params: { page?: number; limit?: number; filters?: FilterOptions } = {}) {
    const { page = 1, limit = 12, filters = {} } = params;
    const queryParams = new URLSearchParams();
    
    queryParams.append('page', page.toString());
    queryParams.append('limit', limit.toString());
    
    if (filters.category) queryParams.append('category', filters.category);
    if (filters.brand) queryParams.append('brand', filters.brand);
    if (filters.minPrice) queryParams.append('minPrice', filters.minPrice.toString());
    if (filters.maxPrice) queryParams.append('maxPrice', filters.maxPrice.toString());
    if (filters.rating) queryParams.append('rating', filters.rating.toString());
    if (filters.sort) queryParams.append('sort', filters.sort);
    if (filters.search) queryParams.append('search', filters.search);
    if (filters.onSale) queryParams.append('onSale', 'true');
    if (filters.newArrivals) queryParams.append('newArrivals', 'true');
    
    return apiService.get(`/products?${queryParams.toString()}`);
  }

  // Get single product
  async getProduct(id: string) {
    return apiService.get(`/products/${id}`);
  }

  // Get product by id (alias for backward compatibility)
  async getProductById(id: string) {
    return this.getProduct(id);
  }

  // Search products
  async searchProducts(query: string) {
    return apiService.get(`/products/search?q=${encodeURIComponent(query)}`);
  }

  // Get featured products
  async getFeaturedProducts() {
    return apiService.get('/products/featured');
  }

  // Get products by category
  async getProductsByCategory(category: string) {
    return apiService.get(`/products/category/${category}`);
  }

  // Get product reviews
  async getProductReviews(productId: string) {
    return apiService.get(`/products/${productId}/reviews`);
  }

  // Get user reviews
  async getUserReviews() {
    return apiService.get('/products/reviews/my');
  }

  // Add product review
  async addProductReview(productId: string, review: any) {
    // If review is FormData, axios handles headers automatically
    // If it's a plain object, it's sent as JSON
    return apiService.post(`/products/${productId}/reviews`, review);
  }

  // Add follow-up review
  async addFollowUpReview(productId: string, reviewId: string, comment: string) {
    return apiService.put(`/products/${productId}/reviews/${reviewId}/followup`, { comment });
  }

  // Add product review
  async addProductQuestion(productId: string, question: { question: string }) {
    return apiService.post(`/products/${productId}/questions`, question);
  }

  // Answer product question (admin)
  async answerProductQuestion(productId: string, questionId: string, answer: { answer: string }) {
    return apiService.put(`/products/${productId}/questions/${questionId}/answer`, answer);
  }

  // Create product (admin only)
  async createProduct(productData: Partial<Product>) {
    return apiService.post('/products', productData);
  }

  // Update product (admin only)
  async updateProduct(id: string, productData: Partial<Product>) {
    return apiService.put(`/products/${id}`, productData);
  }

  // Delete product (admin only)
  async deleteProduct(id: string) {
    return apiService.delete(`/products/${id}`);
  }

  // Upload product images
  async uploadProductImages(productId: string, images: File[]) {
    const formData = new FormData();
    images.forEach((image) => {
      formData.append('images', image);
    });
    return apiService.uploadFile(`/products/${productId}/images`, formData);
  }

  // Delete product image
  async deleteProductImage(productId: string, imageId: string) {
    return apiService.delete(`/products/${productId}/images/${imageId}`);
  }

  // Get product categories
  async getCategories() {
    return apiService.get('/products/categories');
  }

  // Get product brands
  async getBrands() {
    return apiService.get('/products/brands');
  }

  // Get product stats (admin only)
  async getProductStats() {
    return apiService.get('/products/stats');
  }
}

export const productService = new ProductService();
export default productService;
