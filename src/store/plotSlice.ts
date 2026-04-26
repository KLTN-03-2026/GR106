import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Plot } from '../types/plot/plot';

interface PlotStats {
  totalPlots: number;
  totalArea: number;
}

interface PlotState {
  plotsSnapshot: Plot[];
  aggregateStatsSnapshot: PlotStats;
}

const initialState: PlotState = {
  plotsSnapshot: [],
  aggregateStatsSnapshot: {
    totalPlots: 0,
    totalArea: 0,
  },
};

const plotSlice = createSlice({
  name: 'plot',
  initialState,
  reducers: {
    setPlotsSnapshot: (state, action: PayloadAction<Plot[]>) => {
      state.plotsSnapshot = action.payload;
    },
    setAggregateStatsSnapshot: (state, action: PayloadAction<PlotStats>) => {
      state.aggregateStatsSnapshot = action.payload;
    },
    clearPlotState: () => initialState,
  },
});

export const { setPlotsSnapshot, setAggregateStatsSnapshot, clearPlotState } = plotSlice.actions;
export default plotSlice.reducer;
