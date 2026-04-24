import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { warehouseService } from '../services/warehouse/warehouseService';
import { Warehouse, CreateWarehouseRequest } from '../types/warehouse';

interface WarehouseState {
  warehouses: Warehouse[];
  loading: boolean;
  submitting: boolean;
  error: string | null;
}

const initialState: WarehouseState = {
  warehouses: [],
  loading: false,
  submitting: false,
  error: null,
};

export const fetchWarehouses = createAsyncThunk(
  'warehouse/fetchWarehouses',
  async (farmId: string, { rejectWithValue }) => {
    try {
      const res = await warehouseService.getWarehouses(farmId);
      return res.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Không thể tải danh sách kho hàng');
    }
  }
);

export const createWarehouse = createAsyncThunk(
  'warehouse/createWarehouse',
  async (
    { farmId, data }: { farmId: string; data: CreateWarehouseRequest },
    { rejectWithValue }
  ) => {
    try {
      const res = await warehouseService.createWarehouse(farmId, data);
      return res.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Không thể tạo kho hàng');
    }
  }
);

export const deleteWarehouse = createAsyncThunk(
  'warehouse/deleteWarehouse',
  async (
    { farmId, warehouseId }: { farmId: string; warehouseId: string },
    { rejectWithValue }
  ) => {
    try {
      await warehouseService.deleteWarehouse(farmId, warehouseId);
      return warehouseId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Không thể xóa kho hàng');
    }
  }
);

import { logout } from './authSlice';
const warehouseSlice = createSlice({
  name: 'warehouse',
  initialState,
  reducers: {
    clearWarehouseError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(logout, () => initialState)
      // fetchWarehouses
      .addCase(fetchWarehouses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWarehouses.fulfilled, (state, action) => {
        state.loading = false;
        state.warehouses = action.payload;
      })
      .addCase(fetchWarehouses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // createWarehouse
      .addCase(createWarehouse.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(createWarehouse.fulfilled, (state, action) => {
        state.submitting = false;
        state.warehouses.push(action.payload);
      })
      .addCase(createWarehouse.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload as string;
      })
      // deleteWarehouse
      .addCase(deleteWarehouse.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(deleteWarehouse.fulfilled, (state, action) => {
        state.submitting = false;
        state.warehouses = state.warehouses.filter(w => w.id !== action.payload);
      })
      .addCase(deleteWarehouse.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearWarehouseError } = warehouseSlice.actions;
export default warehouseSlice.reducer;
