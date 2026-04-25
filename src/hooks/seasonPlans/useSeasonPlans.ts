import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { 
  fetchPlans, 
  createPlan, 
  updatePlan, 
  removePlan, 
  updatePlanTime,
  fetchPlanPlots,
  addPlotsToPlan,
  fetchStages,
  createPhase,
  removePhase,
  updatePhase,
  updatePhaseTime,
  fetchTasks,
  createSeasonTask,
  updateSeasonTask,
  updateTaskTime,
  removeSeasonTask,
  optimisticallyUpdatePhaseTime,
  optimisticallyUpdateTaskTime,
  addPlan
} from '../../store/seasonPlanSlice';
import { CreateSeasonPlanRequest, SeasonPlan, Task } from '../../types/seasonPlan';
import { useCallback } from 'react';

export const useSeasonPlans = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { plans, loading, createLoading, error } = useSelector(
    (state: RootState) => state.seasonPlan
  );

  return {
    // State
    plans,
    loading,
    createLoading,
    error,

    // Plan Actions
    fetchPlans: useCallback(() => dispatch(fetchPlans()), [dispatch]),
    createPlan: useCallback((data: CreateSeasonPlanRequest) => dispatch(createPlan(data)), [dispatch]),
    updatePlan: useCallback((planId: string, data: Partial<SeasonPlan>) => 
      dispatch(updatePlan({ planId, data })), [dispatch]),
    deletePlan: useCallback((planId: string) => dispatch(removePlan(planId)), [dispatch]),
    updatePlanTime: useCallback((planId: string, startDate: string, endDate: string) => 
      dispatch(updatePlanTime({ planId, startDate, endDate })), [dispatch]),

    // Plot Actions
    fetchPlanPlots: useCallback((planId: string) => dispatch(fetchPlanPlots(planId)), [dispatch]),
    addPlotsToPlan: useCallback((planId: string, plotIds: string[]) => 
      dispatch(addPlotsToPlan({ planId, plotIds })), [dispatch]),

    // Phase Actions
    fetchStages: useCallback((planId: string) => dispatch(fetchStages(planId)), [dispatch]),
    createPhase: useCallback((planId: string, data: { name: string; startDate: string; endDate: string }) => 
      dispatch(createPhase({ planId, data })), [dispatch]),
    deletePhase: useCallback((planId: string, stageId: string) => 
      dispatch(removePhase({ planId, stageId })), [dispatch]),
    updatePhase: useCallback((planId: string, stageId: string, data: { name: string; startDate: string; endDate: string }) => 
      dispatch(updatePhase({ planId, stageId, data })), [dispatch]),

    // State Actions
    addPlanToState: useCallback((plan: SeasonPlan) => dispatch(addPlan(plan)), [dispatch]),
    updatePhaseTime: useCallback((planId: string, stageId: string, data: { startDate: string; endDate: string }) => 
      dispatch(updatePhaseTime({ planId, stageId, data })), [dispatch]),
    optimisticallyUpdatePhaseTime: useCallback((payload: { planId: string; stageId: string; startDate: string; endDate: string }) => 
      dispatch(optimisticallyUpdatePhaseTime(payload)), [dispatch]),

    // Task Actions
    fetchTasks: useCallback((planId: string, stageId: string) => 
      dispatch(fetchTasks({ planId, stageId })), [dispatch]),
    createTask: useCallback((planId: string, stageId: string, data: any) => 
      dispatch(createSeasonTask({ planId, stageId, data })), [dispatch]),
    updateTask: useCallback((planId: string, stageId: string, taskId: string, data: Partial<Task>) => 
      dispatch(updateSeasonTask({ planId, stageId, taskId, data })), [dispatch]),
    updateTaskTime: useCallback((planId: string, stageId: string, taskId: string, data: { startDate: string; endDate: string }) => 
      dispatch(updateTaskTime({ planId, stageId, taskId, data })), [dispatch]),
    deleteTask: useCallback((planId: string, stageId: string, taskId: string) => 
      dispatch(removeSeasonTask({ planId, stageId, taskId })), [dispatch]),
    optimisticallyUpdateTaskTime: useCallback((payload: { planId: string; stageId: string; taskId: string; startDate: string; endDate: string }) => 
      dispatch(optimisticallyUpdateTaskTime(payload)), [dispatch]),
  };
};
