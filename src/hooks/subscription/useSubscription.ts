import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import { RootState } from '@/store';
import { getSubscriptionPlansService } from '@/services/subscription/getSubscriptionPlanService';
import { FarmSubscription } from '@/types/subscription/subscription';

/**
 * Hook để lấy lịch sử đăng ký gói của trang trại hiện tại
 */
export const useSubscriptionHistory = (options?: { enabled?: boolean }) => {
  const enabled = options?.enabled ?? true;
  const { currentFarmId, subscriptionVersion } = useSelector((state: RootState) => state.auth);
  const historyQuery = useQuery({
    queryKey: ['subscription', 'history', currentFarmId, subscriptionVersion],
    queryFn: async () => {
      const res = await getSubscriptionPlansService.getHistory();
      if (!res.success) {
        throw new Error(res.message || 'Không thể tải lịch sử đăng ký');
      }
      return res.data ?? [];
    },
    enabled: Boolean(currentFarmId) && enabled,
  });

  const refresh = useCallback(() => {
    void historyQuery.refetch();
  }, [historyQuery]);

  return {
    data: historyQuery.data ?? [],
    isLoading: historyQuery.isLoading || historyQuery.isFetching,
    error: historyQuery.error instanceof Error ? historyQuery.error.message : null,
    refresh,
  };
};

/**
 * Hook để lấy gói đăng ký hiện tại đang hoạt động của trang trại
 */
export const useCurrentSubscription = (options?: { enabled?: boolean }) => {
  const enabled = options?.enabled ?? true;
  const { currentFarmId, subscriptionVersion } = useSelector((state: RootState) => state.auth);
  const currentQuery = useQuery({
    queryKey: ['subscription', 'current', currentFarmId, subscriptionVersion],
    queryFn: async () => {
      const res = await getSubscriptionPlansService.getCurrent();
      if (!res.success) {
        throw new Error(res.message || 'Không thể tải thông tin gói hiện tại');
      }
      return res.data ?? null;
    },
    enabled: Boolean(currentFarmId) && enabled,
  });

  const refresh = useCallback(() => {
    void currentQuery.refetch();
  }, [currentQuery]);

  return {
    data: (currentQuery.data ?? null) as FarmSubscription | null,
    isLoading: currentQuery.isLoading || currentQuery.isFetching,
    error: currentQuery.error instanceof Error ? currentQuery.error.message : null,
    refresh,
  };
};
