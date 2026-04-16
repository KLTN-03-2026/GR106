import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { axiosInstance } from '../config/axios';
import { 
  getPlotsResponseSchema, 
  createPlotResponseSchema,
  createPlotSchema,
  updatePlotSchema,
  updatePlotResponseSchema
} from '../schemas/plotSchemas';
import { Plot, CreatePlotInput, UpdatePlotInput } from '../types/plot';

interface PlotState {
  plots: Plot[];
  loading: boolean;
  error: any;
}

const initialState: PlotState = {
  plots: [],
  loading: false,
  error: null,
};

// Async Thunk để lấy danh sách Lô đất
export const fetchPlots = createAsyncThunk(
  'plot/fetchPlots',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/api/v1/plots');
      // Validate và parse kết quả bằng Zod
      return getPlotsResponseSchema.parse(response.data).data;
    } catch (error: any) {
      if (error.name === 'ZodError') {
        const firstError = error.errors[0];
        return rejectWithValue(`${firstError.path.join('.')}: ${firstError.message}`);
      }
      return rejectWithValue(error.response?.data?.message || error.message || 'Không thể tải danh sách lô đất');
    }
  }
);

// Async Thunk để tạo Lô đất mới
export const createPlot = createAsyncThunk(
  'plot/createPlot',
  async ({ plotData }: { farmId: string; plotData: CreatePlotInput }, { rejectWithValue }) => {
    try {
      // Validate dữ liệu đầu vào trước khi gửi
      createPlotSchema.parse(plotData);
      const response = await axiosInstance.post('/api/v1/plots', plotData);
      // Validate response
      return createPlotResponseSchema.parse(response.data).data;
    } catch (error: any) {
      if (error.name === 'ZodError') {
        const firstError = error.errors[0];
        return rejectWithValue(`${firstError.path.join('.')}: ${firstError.message}`);
      }
      return rejectWithValue(error.response?.data?.message || error.message || 'Không thể tạo lô đất');
    }
  }
);

// Async Thunk để cập nhật Lô đất
export const updatePlot = createAsyncThunk(
  'plot/updatePlot',
  async ({ plotId, plotData }: { farmId: string; plotId: string; plotData: UpdatePlotInput }, { rejectWithValue }) => {
    try {
      updatePlotSchema.parse(plotData);
      const response = await axiosInstance.patch(`/api/v1/plots/${plotId}`, plotData);
      return updatePlotResponseSchema.parse(response.data).data;
    } catch (error: any) {
      if (error.name === 'ZodError') {
        const firstError = error.errors[0];
        return rejectWithValue(`${firstError.path.join('.')}: ${firstError.message}`);
      }
      return rejectWithValue(error.response?.data?.message || error.message || 'Lỗi cập nhật lô đất');
    }
  }
);

// Async Thunk để xóa Lô đất
export const deletePlot = createAsyncThunk(
  'plot/deletePlot',
  async ({ plotId }: { farmId: string; plotId: string }, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/api/v1/plots/${plotId}`);
      return plotId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Lỗi khi xóa lô đất');
    }
  }
);

const plotSlice = createSlice({
  name: 'plot',
  initialState,
  reducers: {
    clearPlotError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchPlots
      .addCase(fetchPlots.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPlots.fulfilled, (state, action) => {
        state.loading = false;
        state.plots = action.payload;
      })
      .addCase(fetchPlots.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // createPlot
      .addCase(createPlot.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPlot.fulfilled, (state, action) => {
        state.loading = false;
        state.plots.push(action.payload);
      })
      .addCase(createPlot.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // updatePlot
      .addCase(updatePlot.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePlot.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.plots.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) {
          state.plots[index] = action.payload;
        }
      })
      .addCase(updatePlot.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // deletePlot
      .addCase(deletePlot.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePlot.fulfilled, (state, action) => {
        state.loading = false;
        state.plots = state.plots.filter((p) => p.id !== action.payload);
      })
      .addCase(deletePlot.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearPlotError } = plotSlice.actions;
export default plotSlice.reducer;
