import { useCallback, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CreateWarehouseRequest } from '../../types/warehouse/warehouse';
import { warehouseService } from '../../services/warehouse/warehouseService';

const WAREHOUSE_KEYS = {
  byFarm: (farmId: string) => ['warehouses', farmId] as const,
};

const withUnwrap = <T,>(promise: Promise<T>) =>
  Object.assign(promise, { unwrap: () => promise });

const EMPTY_ARRAY: any[] = [];

export const useWarehouses = () => {
  const queryClient = useQueryClient();
  const [farmId, setFarmId] = useState<string | null>(null);

  const warehousesQuery = useQuery({
    queryKey: farmId ? WAREHOUSE_KEYS.byFarm(farmId) : ['warehouses', 'inactive'],
    queryFn: async () => (await warehouseService.getWarehouses(farmId as string)).data ?? [],
    enabled: !!farmId,
  });

  const createWarehouseMutation = useMutation({
    mutationFn: async ({ farmId: targetFarmId, data }: { farmId: string; data: CreateWarehouseRequest }) => {
      const res = await warehouseService.createWarehouse(targetFarmId, data);
      return res.data;
    },
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: WAREHOUSE_KEYS.byFarm(variables.farmId) });
    },
  });

  const deleteWarehouseMutation = useMutation({
    mutationFn: async ({ farmId: targetFarmId, warehouseId }: { farmId: string; warehouseId: string }) => {
      await warehouseService.deleteWarehouse(targetFarmId, warehouseId);
      return warehouseId;
    },
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: WAREHOUSE_KEYS.byFarm(variables.farmId) });
    },
  });

  const loading = warehousesQuery.isLoading || warehousesQuery.isFetching;
  const submitting = createWarehouseMutation.isPending || deleteWarehouseMutation.isPending;
  const error = useMemo(
    () => warehousesQuery.error ?? createWarehouseMutation.error ?? deleteWarehouseMutation.error ?? null,
    [warehousesQuery.error, createWarehouseMutation.error, deleteWarehouseMutation.error],
  );

  return {
    warehouses: warehousesQuery.data ?? EMPTY_ARRAY,
    loading,
    submitting,
    error,
    fetchWarehouses: useCallback(
      (farmIdValue: string) => {
        setFarmId(farmIdValue);
        return withUnwrap(
          queryClient.fetchQuery({
            queryKey: WAREHOUSE_KEYS.byFarm(farmIdValue),
            queryFn: async () => (await warehouseService.getWarehouses(farmIdValue)).data ?? [],
          }),
        );
      },
      [queryClient],
    ),
    createWarehouse: useCallback(
      (farmIdValue: string, data: CreateWarehouseRequest) =>
        withUnwrap(createWarehouseMutation.mutateAsync({ farmId: farmIdValue, data })),
      [createWarehouseMutation],
    ),
    deleteWarehouse: useCallback(
      (farmIdValue: string, warehouseId: string) =>
        withUnwrap(deleteWarehouseMutation.mutateAsync({ farmId: farmIdValue, warehouseId })),
      [deleteWarehouseMutation],
    ),
    clearError: useCallback(() => undefined, []),
  };
};
