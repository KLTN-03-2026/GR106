import { useCallback } from 'react';
import { SeasonPlan, Task } from '../../types/seasonPlan';
import { seasonPlanService } from '../../services/seasonplan/seasonPlanService';
import { withUnwrap } from './seasonPlanShared';

interface UseSeasonPlanTasksProps {
  updatePlansCache: (updater: (prev: SeasonPlan[]) => SeasonPlan[]) => void;
}

export const useSeasonPlanTasks = ({ updatePlansCache }: UseSeasonPlanTasksProps) => {
  return {
    error: null,
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
      (planId: string, stageId: string, data: unknown) =>
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

