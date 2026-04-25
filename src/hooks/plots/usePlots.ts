import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { 
  fetchPlots, 
  createPlot, 
  updatePlot, 
  deletePlot,
  clearPlotError,
  setAggregateStats,
  setPlots,
  clearPlots
} from '../../store/plotSlice';
import { CreatePlotInput, UpdatePlotInput, Plot } from '../../types/plot/plot';
import { useCallback } from 'react';

export const usePlots = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { plots, aggregateStats, loading, error } = useSelector(
    (state: RootState) => state.plot
  );

  return {
    // State
    plots,
    aggregateStats,
    loading,
    error,

    // Actions
    fetchPlots: useCallback((farmId: string) => dispatch(fetchPlots(farmId)), [dispatch]),
    createPlot: useCallback((farmId: string, plotData: CreatePlotInput) => 
      dispatch(createPlot({ farmId, plotData })), [dispatch]),
    updatePlot: useCallback((farmId: string, plotId: string, plotData: UpdatePlotInput) => 
      dispatch(updatePlot({ farmId, plotId, plotData })), [dispatch]),
    deletePlot: useCallback((farmId: string, plotId: string) => 
      dispatch(deletePlot({ farmId, plotId })), [dispatch]),
    clearError: useCallback(() => dispatch(clearPlotError()), [dispatch]),
    setAggregateStats: useCallback((stats: any) => dispatch(setAggregateStats(stats)), [dispatch]),
    setPlots: useCallback((plots: Plot[]) => dispatch(setPlots(plots)), [dispatch]),
    clearPlots: useCallback(() => dispatch(clearPlots()), [dispatch]),
  };
};
