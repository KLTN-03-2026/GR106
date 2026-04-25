import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getSubscriptionPlansService } from '../services/subscription/getSubscriptionPlanService';
import { FarmSubscription } from '../types/subscription/subscription';


interface SubscriptionState {
  currentSubscription: FarmSubscription | null;
  loading: boolean;
  error: string | null;
}

const initialState: SubscriptionState = {
  currentSubscription: null,
  loading: false,
  error: null,
};

export const fetchCurrentSubscription = createAsyncThunk(
  'subscription/fetchCurrent',
  async (_, { rejectWithValue }) => {
    try {
      const res = await getSubscriptionPlansService.getCurrent();
      if (res.success) {
        return res.data;
      }
      return rejectWithValue(res.message || 'Không thể tải thông tin gói hiện tại');
    } catch (error: any) {
      return rejectWithValue(error.message || 'Lỗi kết nối máy chủ');
    }
  }
);

const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState,
  reducers: {
    clearSubscriptionError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase('auth/logout', () => initialState)
      .addCase(fetchCurrentSubscription.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrentSubscription.fulfilled, (state, action) => {
        state.loading = false;
        state.currentSubscription = action.payload;
      })
      .addCase(fetchCurrentSubscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearSubscriptionError } = subscriptionSlice.actions;
export default subscriptionSlice.reducer;
