import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { axiosInstance } from '../config/axios';
import { Supplier, CreateSupplierDto } from '../types/supplier/supplier';

export const fetchSuppliers = createAsyncThunk(
  'supplier/fetchAll',
  async (farmId: string, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`/api/v1/farms/${farmId}/suppliers`);
      return res.data.data as Supplier[];
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Lỗi tải nhà cung cấp');
    }
  }
);

export const createSupplier = createAsyncThunk(
  'supplier/create',
  async ({ farmId, data }: { farmId: string; data: CreateSupplierDto }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post(`/api/v1/farms/${farmId}/suppliers`, data);
      return res.data.data as Supplier;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Lỗi tạo nhà cung cấp');
    }
  }
);

export const deleteSupplier = createAsyncThunk(
  'supplier/delete',
  async ({ farmId, supplierCode }: { farmId: string; supplierCode: string }, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/api/v1/farms/${farmId}/suppliers/${supplierCode}`);
      return supplierCode;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Lỗi xóa nhà cung cấp');
    }
  }
);

interface SupplierState {
  suppliers: Supplier[];
  loading: boolean;
  error: string | null;
}

const supplierSlice = createSlice({
  name: 'supplier',
  initialState: { suppliers: [], loading: false, error: null } as SupplierState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSuppliers.fulfilled, (state, action) => {
        state.suppliers = action.payload;
        state.loading = false;
      })
      .addCase(createSupplier.fulfilled, (state, action) => {
        state.suppliers.push(action.payload);
        state.loading = false;
      })
      .addCase(deleteSupplier.fulfilled, (state, action) => {
        state.suppliers = state.suppliers.filter(s => s.code !== action.payload);
        state.loading = false;
      })
      .addMatcher(
        (action) => action.type.startsWith('supplier/') && action.type.endsWith('/pending'),
        (state) => { state.loading = true; state.error = null; }
      )
      .addMatcher(
        (action) => action.type.startsWith('supplier/') && action.type.endsWith('/rejected'),
        (state, action: any) => { state.loading = false; state.error = action.payload; }
      );
  },
});

export default supplierSlice.reducer;
