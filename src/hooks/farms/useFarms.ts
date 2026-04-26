import { useCallback, useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useDispatch, useSelector } from 'react-redux';
import { CreateFarmInput } from '../../types/farm';
import { farmService } from '../../services/farm/farmService';
import { axiosInstance } from '../../config/axios';
import { AppDispatch, RootState } from '../../store';
import { clearFarmState, setFarmSummarySnapshot, setFarmsSnapshot } from '../../store/farmSlice';

const FARM_KEYS = {
  all: ['farms'] as const,
  list: ['farms', 'list'] as const,
  summary: ['farms', 'summary'] as const,
};

const withUnwrap = <T,>(promise: Promise<T>) =>
  Object.assign(promise, { unwrap: () => promise });

export const useFarms = () => {
  const dispatch = useDispatch<AppDispatch>();
  const farmBridge = useSelector((state: RootState) => state.farm);
  const queryClient = useQueryClient();
  const [manualError, setManualError] = useState<unknown>(null);

  const farmsQuery = useQuery({
    queryKey: FARM_KEYS.list,
    queryFn: async () => {
      const response = await farmService.getMyFarms();
      return response.data ?? [];
    },
    enabled: false,
  });

  const farmSummaryQuery = useQuery({
    queryKey: FARM_KEYS.summary,
    queryFn: async () => {
      const response = await farmService.getFarmSummary();
      return response.data ?? [];
    },
    enabled: false,
  });

  const createFarmMutation = useMutation({
    mutationFn: async (data: CreateFarmInput) => {
      const response = await farmService.createFarm(data);
      return response.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: FARM_KEYS.all });
    },
  });

  const updateFarmMutation = useMutation({
    mutationFn: async ({ farmId, data }: { farmId: string; data: { name: string; description: string } }) => {
      const selectRes = await farmService.selectFarm(farmId);
      if (!selectRes.success || !selectRes.data?.farmToken) {
        throw new Error('Không thể lấy mã định danh trang trại (Farm Token)');
      }

      const response = await axiosInstance.patch(`/api/v1/farms/${farmId}`, data, {
        headers: {
          Authorization: `Bearer ${selectRes.data.farmToken}`,
        },
      });
      return response.data?.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: FARM_KEYS.all });
    },
  });

  const deleteFarmMutation = useMutation({
    mutationFn: async (farmId: string) => {
      const response = await farmService.deleteFarm(farmId);
      if (!response.success) {
        throw new Error(response.message || 'Không thể xóa trang trại');
      }
      return farmId;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: FARM_KEYS.all });
    },
  });

  const loading =
    farmsQuery.isFetching ||
    farmSummaryQuery.isFetching ||
    createFarmMutation.isPending ||
    updateFarmMutation.isPending ||
    deleteFarmMutation.isPending;

  const error = useMemo(() => {
    return (
      manualError ??
      farmsQuery.error ??
      farmSummaryQuery.error ??
      createFarmMutation.error ??
      updateFarmMutation.error ??
      deleteFarmMutation.error ??
      null
    );
  }, [
    manualError,
    farmsQuery.error,
    farmSummaryQuery.error,
    createFarmMutation.error,
    updateFarmMutation.error,
    deleteFarmMutation.error,
  ]);

  useEffect(() => {
    if (farmsQuery.data) {
      dispatch(setFarmsSnapshot(farmsQuery.data));
    }
  }, [dispatch, farmsQuery.data]);

  useEffect(() => {
    if (farmSummaryQuery.data) {
      dispatch(setFarmSummarySnapshot(farmSummaryQuery.data));
    }
  }, [dispatch, farmSummaryQuery.data]);

  return {
    farms: farmsQuery.data ?? farmBridge.farmsSnapshot,
    farmSummary: farmSummaryQuery.data ?? farmBridge.farmSummarySnapshot,
    currentFarm: null,
    loading,
    error,
    fetchFarms: useCallback(() => withUnwrap(farmsQuery.refetch().then((res) => res.data ?? [])), [farmsQuery]),
    fetchFarmsSummary: useCallback(
      () => withUnwrap(farmSummaryQuery.refetch().then((res) => res.data ?? [])),
      [farmSummaryQuery],
    ),
    createFarm: useCallback((data: CreateFarmInput) => withUnwrap(createFarmMutation.mutateAsync(data)), [createFarmMutation]),
    updateFarm: useCallback(
      (farmId: string, data: { name: string; description: string }) =>
        withUnwrap(updateFarmMutation.mutateAsync({ farmId, data })),
      [updateFarmMutation],
    ),
    deleteFarm: useCallback((id: string) => withUnwrap(deleteFarmMutation.mutateAsync(id)), [deleteFarmMutation]),
    clearData: useCallback(() => {
      queryClient.removeQueries({ queryKey: FARM_KEYS.all });
      setManualError(null);
      dispatch(clearFarmState());
    }, [queryClient, dispatch]),
  };
};
