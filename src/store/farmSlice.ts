import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { axiosInstance } from '../config/axios';
import {
  createFarmResponseSchema,
  getFarmsResponseSchema,
  getFarmsSummaryResponseSchema,
  createFarmSchema
} from '../schemas/farmSchemas';
import { FarmResponse, FarmSummary, CreateFarmInput } from '../types/farm';
import { farmService } from '../services/farm/farmService';

export interface FarmState {
  farms: FarmResponse[];
  farmSummary: FarmSummary[];
  currentFarm: FarmResponse | null;
  loading: boolean;
  error: any;
}

const initialState: FarmState = {
  farms: [],
  farmSummary: [],
  currentFarm: null,
  loading: false,
  error: null,
};

// Async Thunk để tạo Farm mới
export const createFarm = createAsyncThunk(
  'farm/createFarm',
  async (farmData: CreateFarmInput, { rejectWithValue }) => {
    try {
      // Validate input data with Zod before sending
      createFarmSchema.parse(farmData);
      const response = await axiosInstance.post('/api/v1/farms', farmData);
      // Validate response data with Zod
      return createFarmResponseSchema.parse(response.data).data;
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return rejectWithValue(error.errors); // Trả về lỗi validation của Zod
      }
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Async Thunk để lấy danh sách tất cả Farms
export const fetchFarms = createAsyncThunk(
  'farm/fetchFarms',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/api/v1/farms');
      return getFarmsResponseSchema.parse(response.data).data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Async Thunk để lấy tóm tắt Farms
export const fetchFarmsSummary = createAsyncThunk(
  'farm/fetchFarmsSummary',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/api/v1/farms/summary');
      return getFarmsSummaryResponseSchema.parse(response.data).data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Async Thunk để cập nhật thông tin Farm
export const updateFarm = createAsyncThunk(
  'farm/updateFarm',
  async ({ farmId, data }: { farmId: string; data: { name: string; description: string } }, { rejectWithValue }) => {
    try {
      // 1. Silent select để lấy farmToken giúp vượt qua yêu cầu token của API update
      const selectRes = await farmService.selectFarm(farmId);
      if (!selectRes.success || !selectRes.data.farmToken) {
        throw new Error('Không thể lấy mã định danh trang trại (Farm Token)');
      }

      // 2. Thực hiện cập nhật với farmToken cụ thể trong headers
      const response = await axiosInstance.patch(`/api/v1/farms/${farmId}`, data, {
        headers: {
          Authorization: `Bearer ${selectRes.data.farmToken}`
        }
      });
      return createFarmResponseSchema.parse(response.data).data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const farmSlice = createSlice({
  name: 'farm',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // createFarm
      .addCase(createFarm.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createFarm.fulfilled, (state, action) => {
        state.loading = false;
        state.currentFarm = action.payload;
        // Optionally add new farm to list
        // state.farms.push(action.payload);
      })
      .addCase(createFarm.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // fetchFarms
      .addCase(fetchFarms.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFarms.fulfilled, (state, action) => {
        state.loading = false;
        state.farms = action.payload;
      })
      .addCase(fetchFarms.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // fetchFarmsSummary
      .addCase(fetchFarmsSummary.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFarmsSummary.fulfilled, (state, action) => {
        state.loading = false;
        state.farmSummary = action.payload ?? [];
      })
      .addCase(fetchFarmsSummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // updateFarm
      .addCase(updateFarm.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateFarm.fulfilled, (state, action) => {
        state.loading = false;
        // Cập nhật farm trong danh sách tóm tắt nếu cần
        state.farmSummary = state.farmSummary.map(f =>
          f.farmId === action.payload.id
            ? { ...f, farmName: action.payload.name, description: action.payload.description }
            : f
        );
        if (state.currentFarm && state.currentFarm.id === action.payload.id) {
          state.currentFarm = action.payload;
        }
      })
      .addCase(updateFarm.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default farmSlice.reducer;
