import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { axiosInstance } from '../config/axios';
import { Sku, CreateSkuDto } from '../types/sku/sku';

export const fetchSkus = createAsyncThunk(
  'sku/fetchAll',
  async (farmId: string, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`/api/v1/farms/${farmId}/skus`);
      return res.data.data as Sku[];
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Lỗi tải SKU');
    }
  }
);

export const createSku = createAsyncThunk(
  'sku/create',
  async ({ farmId, data }: { farmId: string; data: CreateSkuDto }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post(`/api/v1/farms/${farmId}/skus`, data);
      return res.data.data as Sku;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Lỗi tạo SKU');
    }
  }
);

export const deleteSku = createAsyncThunk(
  'sku/delete',
  async ({ farmId, sku }: { farmId: string; sku: string }, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/api/v1/farms/${farmId}/skus/${sku}`);
      return sku;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Lỗi xóa SKU');
    }
  }
);

interface SkuState {
  skus: Sku[];
  loading: boolean;
  error: string | null;
}

const skuSlice = createSlice({
  name: 'sku',
  initialState: { skus: [], loading: false, error: null } as SkuState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSkus.fulfilled, (state, action) => {
        state.skus = action.payload;
        state.loading = false;
      })
      .addCase(createSku.fulfilled, (state, action) => {
        state.skus.push(action.payload);
        state.loading = false;
      })
      .addCase(deleteSku.fulfilled, (state, action) => {
        state.skus = state.skus.filter(s => s.sku !== action.payload);
        state.loading = false;
      })
      .addMatcher(
        (action) => action.type.startsWith('sku/') && action.type.endsWith('/pending'),
        (state) => { state.loading = true; state.error = null; }
      )
      .addMatcher(
        (action) => action.type.startsWith('sku/') && action.type.endsWith('/rejected'),
        (state, action: any) => { state.loading = false; state.error = action.payload; }
      );
  },
});

export default skuSlice.reducer;
