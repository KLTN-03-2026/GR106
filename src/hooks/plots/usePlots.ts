import { useCallback, useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useDispatch, useSelector } from 'react-redux';
import { CreatePlotInput, UpdatePlotInput, Plot } from '../../types/plot/plot';
import { plotService } from '../../services/plots/plotService';
import { dashboardService } from '../../services/dashboard/dashboardService';
import { AppDispatch, RootState } from '../../store';
import { clearPlotState, setAggregateStatsSnapshot, setPlotsSnapshot } from '../../store/plotSlice';

const PLOT_KEYS = {
  all: ['plots'] as const,
  byFarm: (farmId: string) => ['plots', farmId] as const,
  aggregate: (hubToken: string) => ['plots', 'aggregate', hubToken] as const,
};

const withUnwrap = <T,>(promise: Promise<T>) =>
  Object.assign(promise, { unwrap: () => promise });

export const usePlots = () => {
  const dispatch = useDispatch<AppDispatch>();
  const plotBridge = useSelector((state: RootState) => state.plot);
  const queryClient = useQueryClient();
  const [activeFarmId, setActiveFarmId] = useState<string | null>(null);
  const [activeHubToken, setActiveHubToken] = useState<string | null>(null);

  const plotsQuery = useQuery({
    queryKey: activeFarmId ? PLOT_KEYS.byFarm(activeFarmId) : ['plots', 'inactive'],
    queryFn: async () => plotService.getPlots(),
    enabled: false,
  });

  const aggregateQuery = useQuery({
    queryKey: activeHubToken ? PLOT_KEYS.aggregate(activeHubToken) : ['plots', 'aggregate', 'inactive'],
    queryFn: async () => dashboardService.fetchAggregateStats(activeHubToken as string),
    enabled: false,
  });

  const createPlotMutation = useMutation({
    mutationFn: ({ plotData }: { farmId: string; plotData: CreatePlotInput }) => plotService.createPlot(plotData),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: PLOT_KEYS.all });
    },
  });

  const updatePlotMutation = useMutation({
    mutationFn: ({ plotId, plotData }: { farmId: string; plotId: string; plotData: UpdatePlotInput }) =>
      plotService.updatePlot(plotId, plotData),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: PLOT_KEYS.all });
    },
  });

  const deletePlotMutation = useMutation({
    mutationFn: ({ plotId }: { farmId: string; plotId: string }) => plotService.deletePlot(plotId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: PLOT_KEYS.all });
    },
  });

  const loading =
    plotsQuery.isLoading ||
    plotsQuery.isFetching ||
    aggregateQuery.isLoading ||
    aggregateQuery.isFetching ||
    createPlotMutation.isPending ||
    updatePlotMutation.isPending ||
    deletePlotMutation.isPending;

  const error = useMemo(
    () =>
      plotsQuery.error ??
      aggregateQuery.error ??
      createPlotMutation.error ??
      updatePlotMutation.error ??
      deletePlotMutation.error ??
      null,
    [
      plotsQuery.error,
      aggregateQuery.error,
      createPlotMutation.error,
      updatePlotMutation.error,
      deletePlotMutation.error,
    ],
  );

  useEffect(() => {
    if (plotsQuery.data) {
      dispatch(setPlotsSnapshot(plotsQuery.data));
    }
  }, [dispatch, plotsQuery.data]);

  useEffect(() => {
    if (aggregateQuery.data) {
      dispatch(
        setAggregateStatsSnapshot({
          totalPlots: aggregateQuery.data.totalPlots,
          totalArea: aggregateQuery.data.totalArea,
        }),
      );
    }
  }, [dispatch, aggregateQuery.data]);

  return {
    plots: plotsQuery.data ?? plotBridge.plotsSnapshot,
    aggregateStats: aggregateQuery.data
      ? {
          totalPlots: aggregateQuery.data.totalPlots,
          totalArea: aggregateQuery.data.totalArea,
        }
      : plotBridge.aggregateStatsSnapshot,
    loading,
    error,
    fetchPlots: useCallback(
      (farmId: string) => {
        setActiveFarmId(farmId);
        return withUnwrap(queryClient.fetchQuery({ queryKey: PLOT_KEYS.byFarm(farmId), queryFn: () => plotService.getPlots() }));
      },
      [queryClient],
    ),
    createPlot: useCallback(
      (farmId: string, plotData: CreatePlotInput) =>
        withUnwrap(createPlotMutation.mutateAsync({ farmId, plotData })),
      [createPlotMutation],
    ),
    updatePlot: useCallback(
      (farmId: string, plotId: string, plotData: UpdatePlotInput) =>
        withUnwrap(updatePlotMutation.mutateAsync({ farmId, plotId, plotData })),
      [updatePlotMutation],
    ),
    deletePlot: useCallback(
      (farmId: string, plotId: string) => withUnwrap(deletePlotMutation.mutateAsync({ farmId, plotId })),
      [deletePlotMutation],
    ),
    clearError: useCallback(() => undefined, []),
    setAggregateStats: useCallback(
      (stats: { totalPlots: number; totalArea: number }) => {
        dispatch(setAggregateStatsSnapshot(stats));
      },
      [dispatch],
    ),
    setPlots: useCallback((plots: Plot[]) => {
      if (!activeFarmId) return;
      queryClient.setQueryData(PLOT_KEYS.byFarm(activeFarmId), plots);
    }, [activeFarmId, queryClient]),
    clearPlots: useCallback(() => {
      if (!activeFarmId) return;
      queryClient.removeQueries({ queryKey: PLOT_KEYS.byFarm(activeFarmId) });
      dispatch(clearPlotState());
    }, [activeFarmId, queryClient, dispatch]),
    fetchAggregateStats: useCallback(
      (hubToken: string) => {
        setActiveHubToken(hubToken);
        return withUnwrap(
          queryClient.fetchQuery({
            queryKey: PLOT_KEYS.aggregate(hubToken),
            queryFn: () => dashboardService.fetchAggregateStats(hubToken),
          }),
        );
      },
      [queryClient],
    ),
  };
};
