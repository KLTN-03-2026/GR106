import { useCallback, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CreateWarehouseItemDto, WarehouseItem } from '../../types/warehouseItem/warehouseItem';
import { axiosInstance } from '../../config/axios';

const ITEM_KEYS = {
  allByFarm: (farmId: string) => ['warehouse-items', farmId, 'all'] as const,
  byWarehouse: (farmId: string, warehouseId: string) => ['warehouse-items', farmId, warehouseId] as const,
};

const withUnwrap = <T,>(promise: Promise<T>) =>
  Object.assign(promise, { unwrap: () => promise });

export const useWarehouseItems = (farmId?: string | null, warehouseId?: string | null) => {
  const queryClient = useQueryClient();

  const itemsQuery = useQuery({
    queryKey: warehouseId && farmId
      ? ITEM_KEYS.byWarehouse(farmId, warehouseId)
      : farmId
        ? ITEM_KEYS.allByFarm(farmId)
        : ['warehouse-items', 'inactive'],
    queryFn: async (): Promise<WarehouseItem[]> => {
      if (!farmId) return [];
      if (warehouseId) {
        const res = await axiosInstance.get(`/api/v1/farms/${farmId}/warehouses/${warehouseId}/items`);
        return res.data.data ?? [];
      }
      
      // Nếu không có warehouseId, lấy tất cả kho và cộng dồn tồn kho
      try {
        const whRes = await axiosInstance.get(`/api/v1/farms/${farmId}/warehouses`);
        const warehouses = whRes.data.data ?? [];
        if (warehouses.length === 0) return [];

        const itemsPromises = warehouses.map((wh: any) =>
          axiosInstance.get(`/api/v1/farms/${farmId}/warehouses/${wh.id}/items`)
            .then(r => r.data.data ?? [])
            .catch(() => [])
        );

        const allResults = await Promise.all(itemsPromises);
        const flatItems: WarehouseItem[] = allResults.flat();

        const aggregated = flatItems.reduce((acc: Record<string, WarehouseItem>, item) => {
          const key = item.id;
          if (!acc[key]) {
            acc[key] = { ...item };
          } else {
            acc[key].stock += (item.stock || 0);
          }
          return acc;
        }, {});

        return Object.values(aggregated);
      } catch (err) {
        console.error("Lỗi cộng dồn tồn kho:", err);
        const res = await axiosInstance.get(`/api/v1/farms/${farmId}/warehouses/items`);
        return res.data.data ?? [];
      }
    },
    enabled: !!farmId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const createItemMutation = useMutation({
    mutationFn: async ({
      fId,
      wId,
      itemData,
    }: {
      fId: string;
      wId: string;
      itemData: CreateWarehouseItemDto;
    }) => {
      const res = await axiosInstance.post(`/api/v1/farms/${fId}/warehouses/${wId}/items`, itemData);
      return res.data.data;
    },
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: ITEM_KEYS.byWarehouse(variables.fId, variables.wId) });
      void queryClient.invalidateQueries({ queryKey: ITEM_KEYS.allByFarm(variables.fId) });
    },
  });

  const error = useMemo(() => itemsQuery.error ?? createItemMutation.error ?? null, [itemsQuery.error, createItemMutation.error]);

  return {
    items: itemsQuery.data ?? [],
    loading: itemsQuery.isLoading || itemsQuery.isFetching || createItemMutation.isPending,
    error,
    fetchItems: useCallback(
      (fId: string, wId: string): Promise<WarehouseItem[]> => {
        return withUnwrap(
          queryClient.fetchQuery({
            queryKey: ITEM_KEYS.byWarehouse(fId, wId),
            queryFn: async (): Promise<WarehouseItem[]> => {
              const res = await axiosInstance.get(`/api/v1/farms/${fId}/warehouses/${wId}/items`);
              return res.data.data ?? [];
            },
          }),
        );
      },
      [queryClient],
    ),
    fetchAllItems: useCallback(
      (fId: string): Promise<WarehouseItem[]> => {
        return withUnwrap(
          queryClient.fetchQuery({
            queryKey: ITEM_KEYS.allByFarm(fId),
            queryFn: async (): Promise<WarehouseItem[]> => {
              const res = await axiosInstance.get(`/api/v1/farms/${fId}/warehouses/items`);
              return res.data.data ?? [];
            },
          }),
        );
      },
      [queryClient],
    ),
    createItem: useCallback(
      (fId: string, wId: string, itemData: CreateWarehouseItemDto) =>
        withUnwrap(createItemMutation.mutateAsync({ fId, wId, itemData })),
      [createItemMutation],
    ),
  };
};
