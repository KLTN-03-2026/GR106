import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { 
  fetchWarehouseItems, 
  fetchAllWarehouseItems,
  createWarehouseItem, 
} from '../../store/warehouseItemSlice';
import { CreateWarehouseItemDto } from '../../types/warehouseItem/warehouseItem';
import { useCallback } from 'react';

export const useWarehouseItems = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { items, loading, error } = useSelector(
    (state: RootState) => state.warehouseItem
  );

  return {
    // State
    items,
    loading,
    error,

    // Actions
    fetchItems: useCallback((farmId: string, warehouseId: string) => 
      dispatch(fetchWarehouseItems({ farmId, warehouseId })), [dispatch]),
    fetchAllItems: useCallback((farmId: string) => 
      dispatch(fetchAllWarehouseItems(farmId)), [dispatch]),
    createItem: useCallback((farmId: string, warehouseId: string, itemData: CreateWarehouseItemDto) => 
      dispatch(createWarehouseItem({ farmId, warehouseId, itemData })), [dispatch]),
  };
};
