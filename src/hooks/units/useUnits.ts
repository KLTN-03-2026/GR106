import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { unitService } from '../../services/unit/unitService';

const UNIT_KEYS = {
  list: ['units', 'list'] as const,
};

const withUnwrap = <T,>(promise: Promise<T>) =>
  Object.assign(promise, { unwrap: () => promise });

export const useUnits = () => {
  const queryClient = useQueryClient();
  const unitsQuery = useQuery({
    queryKey: UNIT_KEYS.list,
    queryFn: async () => (await unitService.getUnits()).data ?? [],
    enabled: false,
  });

  return {
    units: unitsQuery.data ?? [],
    loading: unitsQuery.isLoading || unitsQuery.isFetching,
    error: unitsQuery.error ?? null,
    fetchUnits: useCallback(
      () =>
        withUnwrap(
          queryClient.fetchQuery({
            queryKey: UNIT_KEYS.list,
            queryFn: async () => (await unitService.getUnits()).data ?? [],
          }),
        ),
      [queryClient],
    ),
  };
};
