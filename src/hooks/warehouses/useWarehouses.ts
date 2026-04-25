import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { 
  fetchWarehouses, 
  createWarehouse, 
  deleteWarehouse,
  clearWarehouseError 
} from '../../store/warehouseSlice';
import { CreateWarehouseRequest } from '../../types/warehouse/warehouse';
import { useCallback } from 'react';

export const useWarehouses = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { warehouses, loading, submitting, error } = useSelector(
    (state: RootState) => state.warehouse
  );

  return {
    // State
    warehouses,
    loading,
    submitting,
    error,

    // Actions
    fetchWarehouses: useCallback((farmId: string) => dispatch(fetchWarehouses(farmId)), [dispatch]),
    createWarehouse: useCallback((farmId: string, data: CreateWarehouseRequest) => 
      dispatch(createWarehouse({ farmId, data })), [dispatch]),
    deleteWarehouse: useCallback((farmId: string, warehouseId: string) => 
      dispatch(deleteWarehouse({ farmId, warehouseId })), [dispatch]),
    clearError: useCallback(() => dispatch(clearWarehouseError()), [dispatch]),
  };
};
