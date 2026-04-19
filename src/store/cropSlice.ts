import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Crop, CropType, CreateCropRequest, CreateCropTypeRequest } from '../types/crop';
import { cropService } from '../services/crop/cropService';

interface CropState {
  crops: Crop[];
  cropTypes: CropType[];
  loading: boolean;
  cropTypesLoading: boolean;
  error: string | null;
}

const initialState: CropState = {
  crops: [],
  cropTypes: [],
  loading: false,
  cropTypesLoading: false,
  error: null,
};

// ──────────────────────────────────────────────
// CROP TYPES Thunks
// ──────────────────────────────────────────────

export const fetchCropTypes = createAsyncThunk(
  'crop/fetchCropTypes',
  async (_, { rejectWithValue }) => {
    try {
      const response = await cropService.getCropTypes();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Không thể tải danh mục loại cây trồng');
    }
  }
);

export const createCropType = createAsyncThunk(
  'crop/createCropType',
  async (data: CreateCropTypeRequest, { rejectWithValue }) => {
    try {
      const response = await cropService.createCropType(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Không thể tạo loại cây trồng');
    }
  }
);

export const deleteCropType = createAsyncThunk(
  'crop/deleteCropType',
  async (cropTypeId: string, { rejectWithValue }) => {
    try {
      await cropService.deleteCropType(cropTypeId);
      return cropTypeId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Không thể xóa loại cây trồng');
    }
  }
);

// ──────────────────────────────────────────────
// CROPS Thunks
// ──────────────────────────────────────────────

export const createCrop = createAsyncThunk(
  'crop/createCrop',
  async (data: CreateCropRequest, { rejectWithValue }) => {
    try {
      const response = await cropService.createCrop(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Không thể thêm cây trồng mới');
    }
  }
);

export const fetchCrops = createAsyncThunk(
  'crop/fetchCrops',
  async (_, { rejectWithValue }) => {
    try {
      const response = await cropService.getCrops();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Không thể tải danh sách cây trồng');
    }
  }
);

// ──────────────────────────────────────────────
// Slice
// ──────────────────────────────────────────────

const cropSlice = createSlice({
  name: 'crop',
  initialState,
  reducers: {
    clearCropError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ── Fetch Crop Types ──
      .addCase(fetchCropTypes.pending, (state) => {
        state.cropTypesLoading = true;
        state.error = null;
      })
      .addCase(fetchCropTypes.fulfilled, (state, action: PayloadAction<CropType[]>) => {
        state.cropTypesLoading = false;
        state.cropTypes = action.payload;
      })
      .addCase(fetchCropTypes.rejected, (state, action) => {
        state.cropTypesLoading = false;
        state.error = action.payload as string;
      })

      // ── Create Crop Type ──
      .addCase(createCropType.fulfilled, (state, action: PayloadAction<CropType>) => {
        state.cropTypes.push(action.payload);
      })

      // ── Delete Crop Type ──
      .addCase(deleteCropType.fulfilled, (state, action: PayloadAction<string>) => {
        state.cropTypes = state.cropTypes.filter((ct) => ct.id !== action.payload);
      })

      // ── Fetch Crops ──
      .addCase(fetchCrops.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCrops.fulfilled, (state, action: PayloadAction<Crop[]>) => {
        state.loading = false;
        state.crops = action.payload || [];
      })
      .addCase(fetchCrops.rejected, (state, action) => {
        state.loading = false;
        // Ghi chú: Có thể lỗi 404 do API chưa có thật
        state.error = action.payload as string;
      })

      // ── Create Crop ──
      .addCase(createCrop.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCrop.fulfilled, (state, action: PayloadAction<Crop>) => {
        state.loading = false;
        state.crops.push(action.payload);
      })
      .addCase(createCrop.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCropError } = cropSlice.actions;
export default cropSlice.reducer;
