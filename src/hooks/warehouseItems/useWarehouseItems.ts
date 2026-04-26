import { useCallback, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CreateWarehouseItemDto } from '../../types/warehouseItem/warehouseItem';
import { axiosInstance } from '../../config/axios';

const ITEM_KEYS = {
  allByFarm: (farmId: string) => ['warehouse-items', farmId, 'all'] as const,
  byWarehouse: (farmId: string, warehouseId: string) => ['warehouse-items', farmId, warehouseId] as const,
};

const withUnwrap = <T,>(promise: Promise<T>) =>
  Object.assign(promise, { unwrap: () => promise });

export const useWarehouseItems = () => {
  const queryClient = useQueryClient();
  const [queryState, setQueryState] = useState<{ farmId: string | null; warehouseId: string | null }>({
    farmId: null,
    warehouseId: null,
  });

  const itemsQuery = useQuery({
    queryKey:
      queryState.farmId && queryState.warehouseId
        ? ITEM_KEYS.byWarehouse(queryState.farmId, queryState.warehouseId)
        : ['warehouse-items', 'inactive'],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/api/v1/farms/${queryState.farmId as string}/warehouses/${queryState.warehouseId as string}/items`,
      );
      return res.data.data ?? [];
    },
    enabled: Boolean(queryState.farmId && queryState.warehouseId),
  });

  const createItemMutation = useMutation({
    mutationFn: async ({
      farmId,
      warehouseId,
      itemData,
    }: {
      farmId: string;
      warehouseId: string;
      itemData: CreateWarehouseItemDto;
    }) => {
      const res = await axiosInstance.post(`/api/v1/farms/${farmId}/warehouses/${warehouseId}/items`, itemData);
      return res.data.data;
    },
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: ITEM_KEYS.byWarehouse(variables.farmId, variables.warehouseId) });
      void queryClient.invalidateQueries({ queryKey: ITEM_KEYS.allByFarm(variables.farmId) });
    },
  });

  const error = useMemo(() => itemsQuery.error ?? createItemMutation.error ?? null, [itemsQuery.error, createItemMutation.error]);

  return {
    items: itemsQuery.data ?? [],
    loading: itemsQuery.isLoading || itemsQuery.isFetching || createItemMutation.isPending,
    error,
    fetchItems: useCallback(
      (farmId: string, warehouseId: string) => {
        setQueryState({ farmId, warehouseId });
        return withUnwrap(
          queryClient.fetchQuery({
            queryKey: ITEM_KEYS.byWarehouse(farmId, warehouseId),
            queryFn: async () => {
              const res = await axiosInstance.get(`/api/v1/farms/${farmId}/warehouses/${warehouseId}/items`);
              return res.data.data ?? [];
            },
          }),
        );
      },
      [queryClient],
    ),
    fetchAllItems: useCallback(
      (farmId: string) =>
        withUnwrap(
          queryClient.fetchQuery({
            queryKey: ITEM_KEYS.allByFarm(farmId),
            queryFn: async () => {
              const res = await axiosInstance.get(`/api/v1/farms/${farmId}/warehouses/items`);
              return res.data.data ?? [];
            },
          }),
        ),
      [queryClient],
    ),
    createItem: useCallback(
      (farmId: string, warehouseId: string, itemData: CreateWarehouseItemDto) =>
        withUnwrap(createItemMutation.mutateAsync({ farmId, warehouseId, itemData })),
      [createItemMutation],
    ),
  };
};
