import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import settingService from '../../services/settingService';

interface SettingsState {
  settings: any | null;
  publicSettings: any | null;
  loading: boolean;
  error: string | null;
}

const initialState: SettingsState = {
  settings: null,
  publicSettings: null,
  loading: false,
  error: null
};

// Async thunks
export const getSettings = createAsyncThunk(
  'settings/getSettings',
  async (_, { rejectWithValue }) => {
    try {
      return await settingService.getSettings();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch settings');
    }
  }
);

export const updateSettings = createAsyncThunk(
  'settings/updateSettings',
  async (settingsData: any, { rejectWithValue }) => {
    try {
      return await settingService.updateSettings(settingsData);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update settings');
    }
  }
);

export const getPublicSettings = createAsyncThunk(
  'settings/getPublicSettings',
  async (_, { rejectWithValue }) => {
    try {
      return await settingService.getPublicSettings();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch public settings');
    }
  }
);

const settingSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get Settings
      .addCase(getSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.settings = action.payload;
      })
      .addCase(getSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update Settings
      .addCase(updateSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.settings = action.payload;
      })
      .addCase(updateSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Get Public Settings
      .addCase(getPublicSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPublicSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.publicSettings = action.payload;
      })
      .addCase(getPublicSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const { clearError } = settingSlice.actions;
export default settingSlice.reducer;
