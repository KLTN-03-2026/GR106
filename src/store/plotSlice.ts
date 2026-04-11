import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { axiosInstance } from '../config/axios';
import { 
  getPlotsResponseSchema, 
  createPlotResponseSchema,
  createPlotSchema,
  Plot,
  CreatePlotInput
} from '../schemas/plotSchemas';

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
        return rejectWithValue(error.errors);
      }
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Async Thunk để tạo Lô đất mới
export const createPlot = createAsyncThunk(
  'plot/createPlot',
  async (plotData: CreatePlotInput, { rejectWithValue }) => {
    try {
      // Validate dữ liệu đầu vào trước khi gửi
      createPlotSchema.parse(plotData);
      const response = await axiosInstance.post('/api/v1/plots', plotData);
      // Validate response
      return createPlotResponseSchema.parse(response.data).data;
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return rejectWithValue(error.errors);
      }
      return rejectWithValue(error.response?.data || error.message);
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
      });
  },
});

export const { clearPlotError } = plotSlice.actions;
export default plotSlice.reducer;
