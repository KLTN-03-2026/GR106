import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Sku } from '../types/sku/sku';

interface SkuState {
  skusSnapshot: Sku[];
}

const initialState: SkuState = {
  skusSnapshot: [],
};

const skuSlice = createSlice({
  name: 'sku',
  initialState,
  reducers: {
    setSkusSnapshot: (state, action: PayloadAction<Sku[]>) => {
      state.skusSnapshot = action.payload;
    },
    clearSkuState: () => initialState,
  },
});

export const { setSkusSnapshot, clearSkuState } = skuSlice.actions;
export default skuSlice.reducer;
