import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiService } from '../../services/api';

interface CurrencyState {
  code: string;
  symbol: string;
  rate: number;
}

interface PreferenceState {
  currency: CurrencyState;
  language: string;
  rates: Record<string, number>;
  loading: boolean;
  error: string | null;
}

const initialState: PreferenceState = {
  currency: {
    code: 'USD',
    symbol: '$',
    rate: 1,
  },
  language: 'en',
  rates: {},
  loading: false,
  error: null,
};

export const fetchRates = createAsyncThunk(
  'preferences/fetchRates',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.get('/currency/rates');
      return response.data.rates;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch rates');
    }
  }
);

const preferenceSlice = createSlice({
  name: 'preferences',
  initialState,
  reducers: {
    setCurrency: (state, action: PayloadAction<string>) => {
      const code = action.payload;
      const rate = state.rates[code] || 1;
      let symbol = '$';
      
      switch (code) {
        case 'EUR': symbol = '€'; break;
        case 'GBP': symbol = '£'; break;
        case 'JPY': symbol = '¥'; break;
        case 'PKR': symbol = 'Rs.'; break;
        default: symbol = '$';
      }

      state.currency = {
        code,
        symbol,
        rate,
      };
    },
    setLanguage: (state, action: PayloadAction<string>) => {
      state.language = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRates.fulfilled, (state, action) => {
        state.loading = false;
        state.rates = action.payload;
        // Update current currency rate if it exists in new rates
        if (state.currency.code !== 'USD' && state.rates[state.currency.code]) {
          state.currency.rate = state.rates[state.currency.code];
        }
      })
      .addCase(fetchRates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setCurrency, setLanguage } = preferenceSlice.actions;
export default preferenceSlice.reducer;
