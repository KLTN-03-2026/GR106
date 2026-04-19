import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { plotService } from '../services/plots/plotService';
import { Plot, CreatePlotInput, UpdatePlotInput } from '../types/plot/plot';

interface PlotStats {
  totalPlots: number;
  totalArea: number;
}

interface PlotState {
  plots: Plot[];
  aggregateStats: PlotStats; // Số liệu tổng hợp toàn hệ thống
  loading: boolean;
  error: any;
}

const initialState: PlotState = {
  plots: [],
  aggregateStats: {
    totalPlots: 0,
    totalArea: 0,
  },
  loading: false,
  error: null,
};

// Async Thunk để lấy danh sách Lô đất
export const fetchPlots = createAsyncThunk(
  'plot/fetchPlots',
  async (_, { rejectWithValue }) => {
    try {
      return await plotService.getPlots();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Không thể tải danh sách lô đất');
    }
  }
);

// Async Thunk để tạo Lô đất mới
export const createPlot = createAsyncThunk(
  'plot/createPlot',
  async ({ plotData }: { farmId: string; plotData: CreatePlotInput }, { rejectWithValue }) => {
    try {
      return await plotService.createPlot(plotData);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Không thể tạo lô đất');
    }
  }
);

// Async Thunk để cập nhật Lô đất
export const updatePlot = createAsyncThunk(
  'plot/updatePlot',
  async ({ plotId, plotData }: { farmId: string; plotId: string; plotData: UpdatePlotInput }, { rejectWithValue }) => {
    try {
      return await plotService.updatePlot(plotId, plotData);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Lỗi cập nhật lô đất');
    }
  }
);

// Async Thunk để xóa Lô đất
export const deletePlot = createAsyncThunk(
  'plot/deletePlot',
  async ({ plotId }: { farmId: string; plotId: string }, { rejectWithValue }) => {
    try {
      await plotService.deletePlot(plotId);
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
    },
    clearPlots: (state) => {
      state.plots = [];
      state.error = null;
    },
    setAggregateStats: (state, action: PayloadAction<PlotStats>) => {
      state.aggregateStats = action.payload;
    },
    setPlots: (state, action: PayloadAction<Plot[]>) => {
      state.plots = action.payload;
      state.loading = false;
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

export const { clearPlotError, clearPlots, setAggregateStats, setPlots } = plotSlice.actions;
export default plotSlice.reducer;
