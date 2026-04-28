import { createSlice } from '@reduxjs/toolkit';

interface PlotState {
  // Server data for plots is managed by React Query.
  // This slice keeps only local UI state when needed.
}

const initialState: PlotState = {
};

const plotSlice = createSlice({
  name: 'plot',
  initialState,
  reducers: {
    clearPlotState: () => initialState,
  },
});

export const { clearPlotState } = plotSlice.actions;
export default plotSlice.reducer;
