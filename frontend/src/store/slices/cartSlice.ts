import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { CartState, CartItem, Address } from '../../types';
import { apiService } from '../../services/api';

const initialState: CartState = {
  items: [],
  totalItems: 0,
  totalPrice: 0,
  shippingAddress: null,
  paymentMethod: 'Stripe',
  coupon: null,
  discount: 0,
  loading: false,
  error: null
};

export const applyCoupon = createAsyncThunk(
  'cart/applyCoupon',
  async ({ code, cartTotal, cartItems }: { code: string; cartTotal: number; cartItems: { product: string; price: number; quantity: number }[] }, { rejectWithValue }) => {
    try {
      const response = await apiService.post('/coupons/validate', { code, cartTotal, cartItems });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.msg || 'Failed to apply coupon');
    }
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const existingItem = state.items.find(item => item.product === action.payload.product);
      
      if (existingItem) {
        const newQuantity = existingItem.quantity + action.payload.quantity;
        existingItem.quantity = Math.min(newQuantity, action.payload.countInStock);
      } else {
        const newItem = { ...action.payload };
        newItem.quantity = Math.min(newItem.quantity, newItem.countInStock);
        state.items.push(newItem);
      }
      
      cartSlice.caseReducers.calculateTotals(state);
    },
    
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.product !== action.payload);
      cartSlice.caseReducers.calculateTotals(state);
    },
    
    updateQuantity: (state, action: PayloadAction<{ productId: string; quantity: number }>) => {
      const item = state.items.find(item => item.product === action.payload.productId);
      if (item) {
        // Ensure we don't exceed stock
        item.quantity = Math.min(action.payload.quantity, item.countInStock);
        cartSlice.caseReducers.calculateTotals(state);
      }
    },
    
    clearCart: (state) => {
      state.items = [];
      state.totalItems = 0;
      state.totalPrice = 0;
    },
    
    setShippingAddress: (state, action: PayloadAction<Address>) => {
      state.shippingAddress = action.payload;
    },
    
    setPaymentMethod: (state, action: PayloadAction<string>) => {
      state.paymentMethod = action.payload;
    },
    
    calculateTotals: (state) => {
      state.totalItems = state.items.reduce((total, item) => total + item.quantity, 0);
      state.totalPrice = state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    },
    removeCoupon: (state) => {
      state.coupon = null;
      state.discount = 0;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(applyCoupon.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(applyCoupon.fulfilled, (state, action) => {
        state.loading = false;
        state.coupon = action.payload.code;
        state.discount = action.payload.discount;
        state.error = null;
      })
      .addCase(applyCoupon.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.coupon = null;
        state.discount = 0;
      });
  }
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  setShippingAddress,
  setPaymentMethod,
  calculateTotals,
  removeCoupon
} = cartSlice.actions;

export default cartSlice.reducer;
