import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { WarehouseItem } from '../types/warehouseItem/warehouseItem';

interface WarehouseItemState {
  warehouseItemsSnapshot: WarehouseItem[];
}

const initialState: WarehouseItemState = {
  warehouseItemsSnapshot: [],
};

const warehouseItemSlice = createSlice({
  name: 'warehouseItem',
  initialState,
  reducers: {
    setWarehouseItemsSnapshot: (state, action: PayloadAction<WarehouseItem[]>) => {
      state.warehouseItemsSnapshot = action.payload;
    },
    clearWarehouseItemState: () => initialState,
  },
});

export const { setWarehouseItemsSnapshot, clearWarehouseItemState } = warehouseItemSlice.actions;
export default warehouseItemSlice.reducer;
