import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { axiosInstance } from '../config/axios';
import { 
  createFarmResponseSchema, 
  getFarmsResponseSchema, 
  getFarmsSummaryResponseSchema,
  createFarmSchema
} from '../schemas/farmSchemas';
import { FarmResponse, FarmSummary, CreateFarmInput } from '../types/farm';

interface FarmState {
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
      });
  },
});

export default farmSlice.reducer;
