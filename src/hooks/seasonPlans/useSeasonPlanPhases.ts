import { useCallback } from 'react';
import { SeasonPlan } from '../../types/seasonPlan';
import { seasonPlanService } from '../../services/seasonplan/seasonPlanService';
import { withUnwrap } from './seasonPlanShared';

interface UseSeasonPlanPhasesProps {
  updatePlansCache: (updater: (prev: SeasonPlan[]) => SeasonPlan[]) => void;
}

export const useSeasonPlanPhases = ({ updatePlansCache }: UseSeasonPlanPhasesProps) => {
  return {
    error: null,
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
  };
};

