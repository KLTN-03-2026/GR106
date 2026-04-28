import { createSlice } from '@reduxjs/toolkit';

interface CropState {
  // Server data for crops and crop types is managed by React Query.
  // This slice keeps only local UI state when needed.
}

const initialState: CropState = {
};

const cropSlice = createSlice({
  name: 'crop',
  initialState,
  reducers: {
    clearCropState: () => initialState,
  },
});

export const { clearCropState } = cropSlice.actions;
export default cropSlice.reducer;
