import { useCallback, useEffect, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useDispatch, useSelector } from 'react-redux';
import { CreateSeasonPlanRequest, SeasonPlan, Task } from '../../types/seasonPlan';
import { seasonPlanService } from '../../services/seasonplan/seasonPlanService';
import { AppDispatch, RootState } from '../../store';
import { setPlansSnapshot, setSelectedPlanId } from '../../store/seasonPlanSlice';

const PLAN_KEYS = {
  all: ['season-plans'] as const,
  list: ['season-plans', 'list'] as const,
};

const withUnwrap = <T,>(promise: Promise<T>) =>
  Object.assign(promise, { unwrap: () => promise });

export const useSeasonPlans = () => {
  const dispatch = useDispatch<AppDispatch>();
  const seasonPlanBridge = useSelector((state: RootState) => state.seasonPlan);
  const queryClient = useQueryClient();

  const plansQuery = useQuery({
    queryKey: PLAN_KEYS.list,
    queryFn: () => seasonPlanService.getPlans(),
    enabled: false,
  });

  const updatePlansCache = useCallback(
    (updater: (prev: SeasonPlan[]) => SeasonPlan[]) => {
      queryClient.setQueryData(PLAN_KEYS.list, (prev: SeasonPlan[] | undefined) => updater(prev ?? []));
    },
    [queryClient],
  );

  const createPlanMutation = useMutation({
    mutationFn: (data: CreateSeasonPlanRequest) => seasonPlanService.createPlan(data),
    onSuccess: (newPlan) => {
      updatePlansCache((prev) => [...prev, newPlan]);
    },
  });

  const deletePlanMutation = useMutation({
    mutationFn: (planId: string) => seasonPlanService.deletePlan(planId).then(() => planId),
    onSuccess: (planId) => {
      updatePlansCache((prev) => prev.filter((p) => p.id !== planId));
    },
  });

  const updatePlanTimeMutation = useMutation({
    mutationFn: ({ planId, startDate, endDate }: { planId: string; startDate: string; endDate: string }) =>
      seasonPlanService.updatePlanTime(planId, { startDate, endDate }),
    onSuccess: (updatedPlan) => {
      updatePlansCache((prev) =>
        prev.map((plan) =>
          plan.id === updatedPlan.id ? { ...updatedPlan, phases: plan.phases, plots: plan.plots } : plan,
        ),
      );
    },
  });

  const loading = plansQuery.isLoading || plansQuery.isFetching;
  const createLoading = createPlanMutation.isPending;
  const error = useMemo(
    () =>
      plansQuery.error ??
      createPlanMutation.error ??
      deletePlanMutation.error ??
      updatePlanTimeMutation.error ??
      null,
    [plansQuery.error, createPlanMutation.error, deletePlanMutation.error, updatePlanTimeMutation.error],
  );

  useEffect(() => {
    if (plansQuery.data) {
      dispatch(setPlansSnapshot(plansQuery.data));
    }
  }, [dispatch, plansQuery.data]);

  return {
    plans: plansQuery.data ?? seasonPlanBridge.plansSnapshot,
    loading,
    createLoading,
    error,

    fetchPlans: useCallback(
      () => withUnwrap(queryClient.fetchQuery({ queryKey: PLAN_KEYS.list, queryFn: () => seasonPlanService.getPlans() })),
      [queryClient],
    ),
    createPlan: useCallback((data: CreateSeasonPlanRequest) => withUnwrap(createPlanMutation.mutateAsync(data)), [createPlanMutation]),
    updatePlan: useCallback(
      (planId: string, data: Partial<SeasonPlan>) => withUnwrap(seasonPlanService.updatePlan(planId, data)),
      [],
    ),
    deletePlan: useCallback((planId: string) => withUnwrap(deletePlanMutation.mutateAsync(planId)), [deletePlanMutation]),
    updatePlanTime: useCallback(
      (planId: string, startDate: string, endDate: string) =>
        withUnwrap(updatePlanTimeMutation.mutateAsync({ planId, startDate, endDate })),
      [updatePlanTimeMutation],
    ),

    fetchPlanPlots: useCallback(
      (planId: string) =>
        withUnwrap(
          seasonPlanService.getPlanPlots(planId).then((plots) => {
            updatePlansCache((prev) => prev.map((p) => (p.id === planId ? { ...p, plots } : p)));
            return { planId, plots };
          }),
        ),
      [updatePlansCache],
    ),
    addPlotsToPlan: useCallback(
      (planId: string, plotIds: string[]) =>
        withUnwrap(
          seasonPlanService.addPlotsToPlan(planId, plotIds).then((result) => {
            updatePlansCache((prev) =>
              prev.map((p) => {
                if (p.id !== planId) return p;
                const current = p.plots ?? [];
                const incoming = result.addedPlots ?? [];
                const merged = [...current];
                incoming.forEach((item: { plotId: string; plotName: string }) => {
                  if (!merged.some((m) => m.plotId === item.plotId)) merged.push(item);
                });
                return { ...p, plots: merged };
              }),
            );
            return { planId, addedPlots: result.addedPlots ?? [] };
          }),
        ),
      [updatePlansCache],
    ),

    fetchStages: useCallback(
      (planId: string) =>
        withUnwrap(
          seasonPlanService.getStages(planId).then((phases) => {
            updatePlansCache((prev) => prev.map((p) => (p.id === planId ? { ...p, phases } : p)));
            return { planId, phases };
          }),
        ),
      [updatePlansCache],
    ),
    createPhase: useCallback(
      (planId: string, data: { name: string; startDate: string; endDate: string }) =>
        withUnwrap(
          seasonPlanService.createStage(planId, data).then((phase) => {
            updatePlansCache((prev) =>
              prev.map((p) => (p.id === planId ? { ...p, phases: [...(p.phases ?? []), phase] } : p)),
            );
            return { planId, phase };
          }),
        ),
      [updatePlansCache],
    ),
    deletePhase: useCallback(
      (planId: string, stageId: string) =>
        withUnwrap(
          seasonPlanService.deleteStage(planId, stageId).then(() => {
            updatePlansCache((prev) =>
              prev.map((p) =>
                p.id === planId ? { ...p, phases: p.phases.filter((ph) => ph.id !== stageId) } : p,
              ),
            );
            return { planId, stageId };
          }),
        ),
      [updatePlansCache],
    ),
    updatePhase: useCallback(
      (planId: string, stageId: string, data: { name: string; startDate: string; endDate: string }) =>
        withUnwrap(
          seasonPlanService.updateStage(planId, stageId, data).then((phase) => {
            updatePlansCache((prev) =>
              prev.map((p) =>
                p.id === planId
                  ? { ...p, phases: p.phases.map((ph) => (ph.id === phase.id ? { ...ph, ...phase } : ph)) }
                  : p,
              ),
            );
            return phase;
          }),
        ),
      [updatePlansCache],
    ),

    addPlanToState: useCallback(
      (plan: SeasonPlan) => {
        updatePlansCache((prev) => [...prev, plan]);
        dispatch(setSelectedPlanId(plan.id));
      },
      [updatePlansCache, dispatch],
    ),
    updatePhaseTime: useCallback(
      (planId: string, stageId: string, data: { startDate: string; endDate: string }) =>
        withUnwrap(
          seasonPlanService.updateStageTime(planId, stageId, data).then((phase) => {
            updatePlansCache((prev) =>
              prev.map((p) =>
                p.id === planId
                  ? { ...p, phases: p.phases.map((ph) => (ph.id === phase.id ? { ...ph, ...phase } : ph)) }
                  : p,
              ),
            );
            return phase;
          }),
        ),
      [updatePlansCache],
    ),
    optimisticallyUpdatePhaseTime: useCallback(
      (payload: { planId: string; stageId: string; startDate: string; endDate: string }) => {
        updatePlansCache((prev) =>
          prev.map((p) =>
            p.id === payload.planId
              ? {
                  ...p,
                  phases: p.phases.map((ph) =>
                    ph.id === payload.stageId
                      ? { ...ph, startDate: payload.startDate, endDate: payload.endDate }
                      : ph,
                  ),
                }
              : p,
          ),
        );
      },
      [updatePlansCache],
    ),

    fetchTasks: useCallback(
      (planId: string, stageId: string) =>
        withUnwrap(
          seasonPlanService.getTasks(planId, stageId).then((tasks) => {
            updatePlansCache((prev) =>
              prev.map((p) =>
                p.id === planId
                  ? {
                      ...p,
                      phases: p.phases.map((ph) => (ph.id === stageId ? { ...ph, tasks } : ph)),
                    }
                  : p,
              ),
            );
            return { planId, stageId, tasks };
          }),
        ),
      [updatePlansCache],
    ),
    createTask: useCallback(
      (planId: string, stageId: string, data: any) =>
        withUnwrap(
          seasonPlanService.createTask(planId, stageId, data).then((task) => {
            updatePlansCache((prev) =>
              prev.map((p) =>
                p.id === planId
                  ? {
                      ...p,
                      phases: p.phases.map((ph) =>
                        ph.id === stageId ? { ...ph, tasks: [...(ph.tasks ?? []), task] } : ph,
                      ),
                    }
                  : p,
              ),
            );
            return { planId, stageId, task };
          }),
        ),
      [updatePlansCache],
    ),
    updateTask: useCallback(
      (planId: string, stageId: string, taskId: string, data: Partial<Task>) =>
        withUnwrap(
          seasonPlanService.updateTask(planId, stageId, taskId, data).then((task) => {
            updatePlansCache((prev) =>
              prev.map((p) =>
                p.id === planId
                  ? {
                      ...p,
                      phases: p.phases.map((ph) =>
                        ph.id === stageId
                          ? {
                              ...ph,
                              tasks: (ph.tasks ?? []).map((t) => (t.id === task.id ? task : t)),
                            }
                          : ph,
                      ),
                    }
                  : p,
              ),
            );
            return { planId, stageId, task };
          }),
        ),
      [updatePlansCache],
    ),
    updateTaskTime: useCallback(
      (planId: string, stageId: string, taskId: string, data: { startDate: string; endDate: string }) =>
        withUnwrap(
          seasonPlanService.updateTaskTime(planId, stageId, taskId, data).then((task) => {
            updatePlansCache((prev) =>
              prev.map((p) =>
                p.id === planId
                  ? {
                      ...p,
                      phases: p.phases.map((ph) =>
                        ph.id === stageId
                          ? {
                              ...ph,
                              tasks: (ph.tasks ?? []).map((t) => (t.id === task.id ? { ...t, ...task } : t)),
                            }
                          : ph,
                      ),
                    }
                  : p,
              ),
            );
            return { planId, stageId, task };
          }),
        ),
      [updatePlansCache],
    ),
    deleteTask: useCallback(
      (planId: string, stageId: string, taskId: string) =>
        withUnwrap(
          seasonPlanService.deleteTask(planId, stageId, taskId).then(() => {
            updatePlansCache((prev) =>
              prev.map((p) =>
                p.id === planId
                  ? {
                      ...p,
                      phases: p.phases.map((ph) =>
                        ph.id === stageId
                          ? { ...ph, tasks: (ph.tasks ?? []).filter((t) => t.id !== taskId) }
                          : ph,
                      ),
                    }
                  : p,
              ),
            );
            return { planId, stageId, taskId };
          }),
        ),
      [updatePlansCache],
    ),
    optimisticallyUpdateTaskTime: useCallback(
      (payload: { planId: string; stageId: string; taskId: string; startDate: string; endDate: string }) => {
        updatePlansCache((prev) =>
          prev.map((p) =>
            p.id === payload.planId
              ? {
                  ...p,
                  phases: p.phases.map((ph) =>
                    ph.id === payload.stageId
                      ? {
                          ...ph,
                          tasks: (ph.tasks ?? []).map((t) =>
                            t.id === payload.taskId
                              ? { ...t, startDate: payload.startDate, endDate: payload.endDate }
                              : t,
                          ),
                        }
                      : ph,
                  ),
                }
              : p,
          ),
        );
      },
      [updatePlansCache],
    ),
  };
};
