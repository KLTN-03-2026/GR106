import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface FarmState {
  selectedFarmId: string | null;
}

const initialState: FarmState = {
  selectedFarmId: null,
};

const farmSlice = createSlice({
  name: 'farm',
  initialState,
  reducers: {
    setSelectedFarmId: (state, action: PayloadAction<string | null>) => {
      state.selectedFarmId = action.payload;
    },
    clearFarmState: () => initialState,
  },
});

export const { setSelectedFarmId, clearFarmState } = farmSlice.actions;
export default farmSlice.reducer;
