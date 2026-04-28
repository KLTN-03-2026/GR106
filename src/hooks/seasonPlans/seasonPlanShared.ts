import { QueryClient } from '@tanstack/react-query';
import { SeasonPlan } from '../../types/seasonPlan';

export const PLAN_KEYS = {
  all: ['season-plans'] as const,
  list: ['season-plans', 'list'] as const,
};

export const withUnwrap = <T,>(promise: Promise<T>) =>
  Object.assign(promise, { unwrap: () => promise });

export const createUpdatePlansCache =
  (queryClient: QueryClient) =>
  (updater: (prev: SeasonPlan[]) => SeasonPlan[]) => {
    queryClient.setQueryData(PLAN_KEYS.list, (prev: SeasonPlan[] | undefined) => updater(prev ?? []));
  };

