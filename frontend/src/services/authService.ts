import { apiService } from './api';

class AuthService {
  // Login user
  async login(credentials: { email: string; password: string }) {
    return apiService.post('/auth/login', credentials);
  }

  // Register user
  async register(userData: { name: string; email: string; password: string; phone: string }) {
    return apiService.post('/auth/register', userData);
  }

  // Get current user
  async getCurrentUser() {
    return apiService.get('/auth/me');
  }

  // Update user profile
  async updateProfile(userData: { name: string; email: string; phone?: string }) {
    return apiService.put('/users/profile', userData);
  }

  // Logout user
  async logout() {
    return apiService.post('/auth/logout');
  }

  // Forgot password
  async forgotPassword(email: string) {
    return apiService.post('/auth/forgot-password', { email });
  }

  // Reset password
  async resetPassword(token: string, password: string) {
    return apiService.post(`/auth/reset-password/${token}`, { password });
  }

  // Change password
  async changePassword(oldPassword: string, newPassword: string) {
    return apiService.post('/users/change-password', { currentPassword: oldPassword, newPassword });
  }

  // Update email
  async updateEmail(newEmail: string) {
    return apiService.put('/users/email', { newEmail });
  }

  // Verify email
  async verifyEmail(token: string) {
    return apiService.post('/auth/verify-email', { token });
  }

  // Resend verification email (Public)
  async resendVerificationEmailPublic(email: string) {
    return apiService.post('/auth/resend-verification-email', { email });
  }

  // Resend verification email (Authenticated)
  async resendVerificationEmail() {
    return apiService.post('/auth/resend-email-verification');
  }

  // Send phone verification
  async sendPhoneVerification() {
    return apiService.post('/auth/send-phone-verification');
  }

  // Verify phone number
  async verifyPhone(verificationCode: string) {
    return apiService.post('/auth/verify-phone', { verificationCode });
  }

  // Resend phone verification
  async resendPhoneVerification() {
    return apiService.post('/auth/resend-verification');
  }

  // Test phone validation
  async testPhoneValidation(phone: string, countryCode?: string) {
    return apiService.post('/auth/test-phone-validation', { phone, countryCode });
  }

  // Become a vendor
  async becomeVendor(shopName: string) {
    return apiService.post('/users/become-vendor', { shopName });
  }
}

export const authService = new AuthService();
export default authService;
