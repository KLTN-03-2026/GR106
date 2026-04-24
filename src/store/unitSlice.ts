import { createSlice, createAsyncThunk, ActionReducerMapBuilder, PayloadAction } from "@reduxjs/toolkit";
import { Unit } from "../types/unit/unit";
import { unitService } from "../services/unit/unitService";

interface UnitState {
  units: Unit[];
  loading: boolean;
  error: string | null;
}

const initialState: UnitState = {
  units: [],
  loading: false,
  error: null,
};

export const fetchUnits = createAsyncThunk("unit/fetchUnits", async () => {
  const response = await unitService.getUnits();
  return response.data;
});

const unitSlice = createSlice({
  name: "unit",
  initialState,
  reducers: {},
  extraReducers: (builder: ActionReducerMapBuilder<UnitState>) => {
    builder
      .addCase(fetchUnits.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUnits.fulfilled, (state, action: PayloadAction<Unit[]>) => {
        state.loading = false;
        state.units = action.payload;
      })
      .addCase(fetchUnits.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch units";
      });
  },
});

export default unitSlice.reducer;
