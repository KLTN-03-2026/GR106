import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Warehouse } from '../types/warehouse/warehouse';

interface WarehouseState {
  warehousesSnapshot: Warehouse[];
  selectedWarehouseId: string | null;
}

const initialState: WarehouseState = {
  warehousesSnapshot: [],
  selectedWarehouseId: null,
};

const warehouseSlice = createSlice({
  name: 'warehouse',
  initialState,
  reducers: {
    setWarehousesSnapshot: (state, action: PayloadAction<Warehouse[]>) => {
      state.warehousesSnapshot = action.payload;
    },
    setSelectedWarehouseId: (state, action: PayloadAction<string | null>) => {
      state.selectedWarehouseId = action.payload;
    },
    clearWarehouseState: () => initialState,
  },
});

export const { setWarehousesSnapshot, setSelectedWarehouseId, clearWarehouseState } = warehouseSlice.actions;
export default warehouseSlice.reducer;
