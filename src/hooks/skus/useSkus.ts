import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { 
  fetchSkus, 
  createSku, 
  deleteSku,
} from '../../store/skuSlice';
import { CreateSkuDto } from '../../types/sku/sku';
import { useCallback } from 'react';

export const useSkus = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { skus, loading, error } = useSelector(
    (state: RootState) => state.sku
  );

  return {
    // State
    skus,
    loading,
    error,

    // Actions
    fetchSkus: useCallback((farmId: string) => dispatch(fetchSkus(farmId)), [dispatch]),
    createSku: useCallback((farmId: string, data: CreateSkuDto) => 
      dispatch(createSku({ farmId, data })), [dispatch]),
    deleteSku: useCallback((farmId: string, sku: string) => 
      dispatch(deleteSku({ farmId, sku })), [dispatch]),
  };
};
