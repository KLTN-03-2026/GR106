import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { 
  fetchSuppliers, 
  createSupplier, 
  deleteSupplier,
} from '../../store/supplierSlice';
import { CreateSupplierDto } from '../../types/supplier/supplier';
import { useCallback } from 'react';

export const useSuppliers = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { suppliers, loading, error } = useSelector(
    (state: RootState) => state.supplier
  );

  return {
    // State
    suppliers,
    loading,
    error,

    // Actions
    fetchSuppliers: useCallback((farmId: string) => dispatch(fetchSuppliers(farmId)), [dispatch]),
    createSupplier: useCallback((farmId: string, data: CreateSupplierDto) => 
      dispatch(createSupplier({ farmId, data })), [dispatch]),
    deleteSupplier: useCallback((farmId: string, supplierCode: string) => 
      dispatch(deleteSupplier({ farmId, supplierCode })), [dispatch]),
  };
};
