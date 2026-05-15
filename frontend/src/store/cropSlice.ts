import { createSlice } from '@reduxjs/toolkit';

type CropState = Record<string, never>;

const initialState: CropState = {};

const cropSlice = createSlice({
  name: 'crop',
  initialState,
  reducers: {
    clearCropState: () => initialState,
  },
});

export const { clearCropState } = cropSlice.actions;
export default cropSlice.reducer;
