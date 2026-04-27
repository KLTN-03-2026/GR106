import { useCallback, useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useDispatch, useSelector } from 'react-redux';
import { CreateSupplierDto } from '../../types/supplier/supplier';
import { axiosInstance } from '../../config/axios';
import { AppDispatch, RootState } from '../../store';
import { setSuppliersSnapshot } from '../../store/supplierSlice';

const SUPPLIER_KEYS = {
  byFarm: (farmId: string) => ['suppliers', farmId] as const,
};

const withUnwrap = <T,>(promise: Promise<T>) =>
  Object.assign(promise, { unwrap: () => promise });

export const useSuppliers = () => {
  const dispatch = useDispatch<AppDispatch>();
  const supplierBridge = useSelector((state: RootState) => state.supplier);
  const queryClient = useQueryClient();
  const [farmId, setFarmId] = useState<string | null>(null);

  const suppliersQuery = useQuery({
    queryKey: farmId ? SUPPLIER_KEYS.byFarm(farmId) : ['suppliers', 'inactive'],
    queryFn: async () => {
      const res = await axiosInstance.get(`/api/v1/farms/${farmId as string}/suppliers`);
      return res.data.data ?? [];
    },
    enabled: false,
  });

  const createSupplierMutation = useMutation({
    mutationFn: async ({ farmId: targetFarmId, data }: { farmId: string; data: CreateSupplierDto }) => {
      const res = await axiosInstance.post(`/api/v1/farms/${targetFarmId}/suppliers`, data);
      return res.data.data;
    },
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: SUPPLIER_KEYS.byFarm(variables.farmId) });
    },
  });

  const deleteSupplierMutation = useMutation({
    mutationFn: async ({ farmId: targetFarmId, supplierCode }: { farmId: string; supplierCode: string }) => {
      await axiosInstance.delete(`/api/v1/farms/${targetFarmId}/suppliers/${supplierCode}`);
      return supplierCode;
    },
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: SUPPLIER_KEYS.byFarm(variables.farmId) });
    },
  });

  const loading =
    suppliersQuery.isLoading || suppliersQuery.isFetching || createSupplierMutation.isPending || deleteSupplierMutation.isPending;
  const error = useMemo(
    () => suppliersQuery.error ?? createSupplierMutation.error ?? deleteSupplierMutation.error ?? null,
    [suppliersQuery.error, createSupplierMutation.error, deleteSupplierMutation.error],
  );

  useEffect(() => {
    if (suppliersQuery.data) {
      dispatch(setSuppliersSnapshot(suppliersQuery.data));
    }
  }, [dispatch, suppliersQuery.data]);

  return {
    suppliers: suppliersQuery.data ?? supplierBridge.suppliersSnapshot,
    loading,
    error,
    fetchSuppliers: useCallback(
      (farmIdValue: string) => {
        setFarmId(farmIdValue);
        return withUnwrap(
          queryClient.fetchQuery({
            queryKey: SUPPLIER_KEYS.byFarm(farmIdValue),
            queryFn: async () => {
              const res = await axiosInstance.get(`/api/v1/farms/${farmIdValue}/suppliers`);
              return res.data.data ?? [];
            },
          }),
        );
      },
      [queryClient],
    ),
    createSupplier: useCallback(
      (farmIdValue: string, data: CreateSupplierDto) =>
        withUnwrap(createSupplierMutation.mutateAsync({ farmId: farmIdValue, data })),
      [createSupplierMutation],
    ),
    deleteSupplier: useCallback(
      (farmIdValue: string, supplierCode: string) =>
        withUnwrap(deleteSupplierMutation.mutateAsync({ farmId: farmIdValue, supplierCode })),
      [deleteSupplierMutation],
    ),
  };
};
