import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Unit } from '../types/unit/unit';

interface UnitState {
  unitsSnapshot: Unit[];
}

const initialState: UnitState = {
  unitsSnapshot: [],
};

const unitSlice = createSlice({
  name: 'unit',
  initialState,
  reducers: {
    setUnitsSnapshot: (state, action: PayloadAction<Unit[]>) => {
      state.unitsSnapshot = action.payload;
    },
    clearUnitState: () => initialState,
  },
});

export const { setUnitsSnapshot, clearUnitState } = unitSlice.actions;
export default unitSlice.reducer;
