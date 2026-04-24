import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { axiosInstance } from '../config/axios';
import { WarehouseItem, CreateWarehouseItemDto } from '../types/warehouseItem/warehouseItem';

// Fetch tất cả items của farm (across all warehouses)
export const fetchAllWarehouseItems = createAsyncThunk(
  'warehouseItem/fetchAll',
  async (farmId: string, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`/api/v1/farms/${farmId}/warehouses/items`);
      return res.data.data as WarehouseItem[];
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Lỗi tải danh sách vật tư');
    }
  }
);

// Fetch items theo warehouseId cụ thể
export const fetchWarehouseItems = createAsyncThunk(
  'warehouseItem/fetchByWarehouse',
  async ({ farmId, warehouseId }: { farmId: string; warehouseId: string }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`/api/v1/farms/${farmId}/warehouses/${warehouseId}/items`);
      return res.data.data as WarehouseItem[];
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Lỗi tải vật tư');
    }
  }
);

export const createWarehouseItem = createAsyncThunk(
  'warehouseItem/create',
  async (
    { farmId, warehouseId, itemData }: { farmId: string; warehouseId: string; itemData: CreateWarehouseItemDto },
    { rejectWithValue }
  ) => {
    try {
      const res = await axiosInstance.post(`/api/v1/farms/${farmId}/warehouses/${warehouseId}/items`, itemData);
      return res.data.data as WarehouseItem;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Lỗi tạo vật tư');
    }
  }
);

interface WarehouseItemState {
  items: WarehouseItem[];
  loading: boolean;
  error: string | null;
}

const initialState: WarehouseItemState = {
  items: [],
  loading: false,
  error: null,
};

const warehouseItemSlice = createSlice({
  name: 'warehouseItem',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    const pending = (state: WarehouseItemState) => { state.loading = true; state.error = null; };
    const rejected = (state: WarehouseItemState, action: any) => { state.loading = false; state.error = action.payload; };

    builder
      .addCase(fetchAllWarehouseItems.pending, pending)
      .addCase(fetchAllWarehouseItems.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchAllWarehouseItems.rejected, rejected)

      .addCase(fetchWarehouseItems.pending, pending)
      .addCase(fetchWarehouseItems.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchWarehouseItems.rejected, rejected)

      .addCase(createWarehouseItem.pending, pending)
      .addCase(createWarehouseItem.fulfilled, (state, action) => {
        state.loading = false;
        state.items.push(action.payload);
      })
      .addCase(createWarehouseItem.rejected, rejected);
  },
});

export default warehouseItemSlice.reducer;
