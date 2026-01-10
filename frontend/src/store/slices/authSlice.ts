import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, User } from '../../types';
import { authService } from '../../services/authService';

// Initial state
const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  loading: false,
  error: null,
};

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData: { name: string; email: string; password: string; phone: string }, { rejectWithValue }) => {
    try {
      const response = await authService.register(userData);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.errors?.[0]?.msg || 
                          error.response?.data?.message || 
                          'Registration failed';
      return rejectWithValue(errorMessage);
    }
  }
);

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.getCurrentUser();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get user');
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (userData: { name: string; email: string; phone?: string }, { rejectWithValue }) => {
    try {
      const response = await authService.updateProfile(userData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Profile update failed');
    }
  }
);

export const verifyPhone = createAsyncThunk(
  'auth/verifyPhone',
  async (verificationCode: string, { rejectWithValue }) => {
    try {
      const response = await authService.verifyPhone(verificationCode);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.errors?.[0]?.msg || 
                          error.response?.data?.message || 
                          'Phone verification failed';
      return rejectWithValue(errorMessage);
    }
  }
);

export const resendPhoneVerification = createAsyncThunk(
  'auth/resendPhoneVerification',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.resendPhoneVerification();
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.errors?.[0]?.msg || 
                          error.response?.data?.message || 
                          'Failed to resend verification code';
      return rejectWithValue(errorMessage);
    }
  }
);

export const verifyEmail = createAsyncThunk(
  'auth/verifyEmail',
  async (token: string, { rejectWithValue }) => {
    try {
      const response = await authService.verifyEmail(token);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.errors?.[0]?.msg || 
                          error.response?.data?.message || 
                          'Email verification failed';
      return rejectWithValue(errorMessage);
    }
  }
);

export const resendEmailVerification = createAsyncThunk(
  'auth/resendEmailVerification',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.resendVerificationEmail();
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.errors?.[0]?.msg || 
                          error.response?.data?.message || 
                          'Failed to resend email verification';
      return rejectWithValue(errorMessage);
    }
  }
);

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email: string, { rejectWithValue }) => {
    try {
      const response = await authService.forgotPassword(email);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.errors?.[0]?.msg || 
                          error.response?.data?.message || 
                          'Failed to send password reset email';
      return rejectWithValue(errorMessage);
    }
  }
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async ({ token, password }: { token: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await authService.resetPassword(token, password);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.errors?.[0]?.msg || 
                          error.response?.data?.message || 
                          'Password reset failed';
      return rejectWithValue(errorMessage);
    }
  }
);

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async ({ oldPassword, newPassword }: { oldPassword: string; newPassword: string }, { rejectWithValue }) => {
    try {
      const response = await authService.changePassword(oldPassword, newPassword);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.errors?.[0]?.msg || 
                          error.response?.data?.message || 
                          'Password change failed';
      return rejectWithValue(errorMessage);
    }
  }
);

export const updateEmail = createAsyncThunk(
  'auth/updateEmail',
  async ({ newEmail }: { newEmail: string }, { rejectWithValue }) => {
    try {
      const response = await authService.updateEmail(newEmail);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.errors?.[0]?.msg || 
                          error.response?.data?.message || 
                          'Email update failed';
      return rejectWithValue(errorMessage);
    }
  }
);

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem('token');
    },
    clearError: (state) => {
      state.error = null;
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      localStorage.setItem('token', action.payload);
    },
    setCredentials: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      localStorage.setItem('token', action.payload.token);
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
        localStorage.setItem('token', action.payload.token);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        if (action.payload.emailVerificationRequired) {
          state.loading = false;
          state.user = null;
          state.token = null;
          state.isAuthenticated = false;
          state.error = null;
        } else {
          state.loading = false;
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.isAuthenticated = true;
          state.error = null;
          localStorage.setItem('token', action.payload.token);
        }
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      })
      // Get current user
      .addCase(getCurrentUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        localStorage.removeItem('token');
      })
      // Update profile
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Verify phone
      .addCase(verifyPhone.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyPhone.fulfilled, (state, action) => {
        state.loading = false;
        if (state.user) {
          state.user.phoneVerified = true;
        }
        state.error = null;
      })
      .addCase(verifyPhone.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Resend phone verification
      .addCase(resendPhoneVerification.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resendPhoneVerification.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(resendPhoneVerification.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Email verification
      .addCase(verifyEmail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyEmail.fulfilled, (state, action) => {
        state.loading = false;
        if (state.user) {
          state.user.emailVerified = true;
        }
        state.error = null;
      })
      .addCase(verifyEmail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Resend email verification
      .addCase(resendEmailVerification.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resendEmailVerification.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(resendEmailVerification.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Forgot password
      .addCase(forgotPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Reset password
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Change password
      .addCase(changePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update email
      .addCase(updateEmail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateEmail.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(updateEmail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout, clearError, setToken, setCredentials } = authSlice.actions;
export default authSlice.reducer;
