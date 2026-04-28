import { createSlice } from '@reduxjs/toolkit';

type PlotState = Record<string, never>;

const initialState: PlotState = {};

const plotSlice = createSlice({
  name: 'plot',
  initialState,
  reducers: {
    clearPlotState: () => initialState,
  },
});

export const { clearPlotState } = plotSlice.actions;
export default plotSlice.reducer;
