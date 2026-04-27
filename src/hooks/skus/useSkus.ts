import { useCallback, useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useDispatch, useSelector } from 'react-redux';
import { CreateSkuDto, Sku } from '../../types/sku/sku';
import { axiosInstance } from '../../config/axios';
import { AppDispatch, RootState } from '../../store';
import { setSkusSnapshot } from '../../store/skuSlice';

const SKU_KEYS = {
  byFarm: (farmId: string) => ['skus', farmId] as const,
};

const withUnwrap = <T,>(promise: Promise<T>) =>
  Object.assign(promise, { unwrap: () => promise });

export const useSkus = () => {
  const dispatch = useDispatch<AppDispatch>();
  const skuBridge = useSelector((state: RootState) => state.sku);
  const queryClient = useQueryClient();
  const [farmId, setFarmId] = useState<string | null>(null);

  const skusQuery = useQuery({
    queryKey: farmId ? SKU_KEYS.byFarm(farmId) : ['skus', 'inactive'],
    queryFn: async (): Promise<Sku[]> => {
      const res = await axiosInstance.get(`/api/v1/farms/${farmId as string}/skus`);
      return res.data.data ?? [];
    },
    enabled: false,
  });

  const createSkuMutation = useMutation({
    mutationFn: async ({ farmId: targetFarmId, data }: { farmId: string; data: CreateSkuDto }) => {
      const res = await axiosInstance.post(`/api/v1/farms/${targetFarmId}/skus`, data);
      return res.data.data;
    },
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: SKU_KEYS.byFarm(variables.farmId) });
    },
  });

  const deleteSkuMutation = useMutation({
    mutationFn: async ({ farmId: targetFarmId, sku }: { farmId: string; sku: string }) => {
      await axiosInstance.delete(`/api/v1/farms/${targetFarmId}/skus/${sku}`);
      return sku;
    },
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: SKU_KEYS.byFarm(variables.farmId) });
    },
  });

  const loading = skusQuery.isLoading || skusQuery.isFetching || createSkuMutation.isPending || deleteSkuMutation.isPending;
  const error = useMemo(() => skusQuery.error ?? createSkuMutation.error ?? deleteSkuMutation.error ?? null, [
    skusQuery.error,
    createSkuMutation.error,
    deleteSkuMutation.error,
  ]);

  useEffect(() => {
    if (skusQuery.data) {
      dispatch(setSkusSnapshot(skusQuery.data));
    }
  }, [dispatch, skusQuery.data]);

  return {
    skus: skusQuery.data ?? skuBridge.skusSnapshot,
    loading,
    error,
    fetchSkus: useCallback(
      (farmIdValue: string): Promise<Sku[]> => {
        setFarmId(farmIdValue);
        return withUnwrap(
          queryClient.fetchQuery({
            queryKey: SKU_KEYS.byFarm(farmIdValue),
            queryFn: async (): Promise<Sku[]> => {
              const res = await axiosInstance.get(`/api/v1/farms/${farmIdValue}/skus`);
              return res.data.data ?? [];
            },
          }),
        );
      },
      [queryClient],
    ),
    createSku: useCallback(
      (farmIdValue: string, data: CreateSkuDto) => withUnwrap(createSkuMutation.mutateAsync({ farmId: farmIdValue, data })),
      [createSkuMutation],
    ),
    deleteSku: useCallback(
      (farmIdValue: string, sku: string) => withUnwrap(deleteSkuMutation.mutateAsync({ farmId: farmIdValue, sku })),
      [deleteSkuMutation],
    ),
  };
};
