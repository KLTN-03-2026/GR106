import { useCallback, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CreateWarehouseItemDto, WarehouseItem } from '../../types/warehouseItem/warehouseItem';
import { warehouseItemService } from '../../services/warehouseItem/warehouseItemService';

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
        return warehouseItemService.getWarehouseItems(farmId, warehouseId);
      }
      
      // Nếu không có warehouseId, lấy tất cả kho và cộng dồn tồn kho
      try {
        const warehouses = await warehouseItemService.getFarmWarehouses(farmId);
        if (warehouses.length === 0) return [];

        const itemsPromises = warehouses.map((wh: any) =>
          warehouseItemService.getWarehouseItems(farmId, wh.id)
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
        return warehouseItemService.getFarmWarehouseItems(farmId);
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
      return warehouseItemService.createWarehouseItem(fId, wId, itemData);
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
              return warehouseItemService.getWarehouseItems(fId, wId);
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
              return warehouseItemService.getFarmWarehouseItems(fId);
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
