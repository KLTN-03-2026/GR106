import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Crop, CropType } from '../types/crop';

interface CropState {
  cropsSnapshot: Crop[];
  cropTypesSnapshot: CropType[];
}

const initialState: CropState = {
  cropsSnapshot: [],
  cropTypesSnapshot: [],
};

const cropSlice = createSlice({
  name: 'crop',
  initialState,
  reducers: {
    setCropsSnapshot: (state, action: PayloadAction<Crop[]>) => {
      state.cropsSnapshot = action.payload;
    },
    setCropTypesSnapshot: (state, action: PayloadAction<CropType[]>) => {
      state.cropTypesSnapshot = action.payload;
    },
    clearCropState: () => initialState,
  },
});

export const { setCropsSnapshot, setCropTypesSnapshot, clearCropState } = cropSlice.actions;
export default cropSlice.reducer;
