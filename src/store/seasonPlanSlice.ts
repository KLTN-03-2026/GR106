import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SeasonPlan } from '../types/seasonPlan';

interface SeasonPlanState {
  plansSnapshot: SeasonPlan[];
  selectedPlanId: string | null;
}

const initialState: SeasonPlanState = {
  plansSnapshot: [],
  selectedPlanId: null,
};

const seasonPlanSlice = createSlice({
  name: 'seasonPlan',
  initialState,
  reducers: {
    setPlansSnapshot: (state, action: PayloadAction<SeasonPlan[]>) => {
      state.plansSnapshot = action.payload;
    },
    setSelectedPlanId: (state, action: PayloadAction<string | null>) => {
      state.selectedPlanId = action.payload;
    },
    clearSeasonPlanState: () => initialState,
  },
});

export const { setPlansSnapshot, setSelectedPlanId, clearSeasonPlanState } = seasonPlanSlice.actions;
export default seasonPlanSlice.reducer;
