import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Supplier } from '../types/supplier/supplier';

interface SupplierState {
  suppliersSnapshot: Supplier[];
}

const initialState: SupplierState = {
  suppliersSnapshot: [],
};

const supplierSlice = createSlice({
  name: 'supplier',
  initialState,
  reducers: {
    setSuppliersSnapshot: (state, action: PayloadAction<Supplier[]>) => {
      state.suppliersSnapshot = action.payload;
    },
    clearSupplierState: () => initialState,
  },
});

export const { setSuppliersSnapshot, clearSupplierState } = supplierSlice.actions;
export default supplierSlice.reducer;
