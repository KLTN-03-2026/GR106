import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { FarmResponse, FarmSummary } from '../types/farm';

interface FarmState {
  farmsSnapshot: FarmResponse[];
  farmSummarySnapshot: FarmSummary[];
  selectedFarmId: string | null;
}

const initialState: FarmState = {
  farmsSnapshot: [],
  farmSummarySnapshot: [],
  selectedFarmId: null,
};

const farmSlice = createSlice({
  name: 'farm',
  initialState,
  reducers: {
    setFarmsSnapshot: (state, action: PayloadAction<FarmResponse[]>) => {
      state.farmsSnapshot = action.payload;
    },
    setFarmSummarySnapshot: (state, action: PayloadAction<FarmSummary[]>) => {
      state.farmSummarySnapshot = action.payload;
    },
    setSelectedFarmId: (state, action: PayloadAction<string | null>) => {
      state.selectedFarmId = action.payload;
    },
    clearFarmState: () => initialState,
  },
});

export const { setFarmsSnapshot, setFarmSummarySnapshot, setSelectedFarmId, clearFarmState } = farmSlice.actions;
export default farmSlice.reducer;
