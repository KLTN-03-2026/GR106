import { axiosInstance } from '../config/axios';
import { SeasonPlan, CreateSeasonPlanRequest, Phase, Task } from '../types/seasonPlan';
import { 
  getPlansResponseSchema, 
  createPlanResponseSchema,
  getStagesResponseSchema,
  createStageResponseSchema,
  getTasksResponseSchema,
  createTaskResponseSchema
} from '../schemas/seasonPlanSchemas';

/**
 * Service Quản lý kế hoạch sản xuất (Season Plan) & Công việc (Task)
 * Đồng bộ theo API Backend: /api/v1/plans
 */
export const seasonPlanService = {
  /**
   * Lấy danh sách kế hoạch của farm hiện tại
   */
  async getPlans(): Promise<SeasonPlan[]> {
    const response = await axiosInstance.get('/api/v1/plans');
    const validated = getPlansResponseSchema.parse(response.data);
    
    return validated.data.map(plan => ({
      ...plan,
      plotId: plan.plotId || '',
      cropId: plan.cropId || '',
      phases: [], 
      description: plan.note || '',
    })) as SeasonPlan[];
  },

  /**
   * Tạo kế hoạch mới
   */
  async createPlan(data: CreateSeasonPlanRequest): Promise<SeasonPlan> {
    const payload = {
      name: data.name,
      cropId: data.cropId,
      startDate: data.startDate,
      endDate: (data as any).endDate || data.startDate,
      note: (data as any).note || '',
      plotId: data.plotId, 
    };

    const response = await axiosInstance.post('/api/v1/plans', payload);
    const validated = createPlanResponseSchema.parse(response.data);
    
    return {
      ...validated.data,
      plotId: validated.data.plotId || payload.plotId,
      cropId: validated.data.cropId || payload.cropId,
      phases: [],
      description: validated.data.note || '',
    } as SeasonPlan;
  },

  // --- STAGE APIs ---

  async getStages(planId: string): Promise<Phase[]> {
    const response = await axiosInstance.get(`/api/v1/plans/${planId}/stages`);
    const validated = getStagesResponseSchema.parse(response.data);
    return validated.data.map(stage => ({
      ...stage,
      tasks: [], // Tasks are fetched separately
    })) as Phase[];
  },

  async createStage(planId: string, data: { name: string; startDate: string; endDate: string }): Promise<Phase> {
    const response = await axiosInstance.post(`/api/v1/plans/${planId}/stages`, data);
    const validated = createStageResponseSchema.parse(response.data);
    return { ...validated.data, tasks: [] } as Phase;
  },

  async deleteStage(planId: string, stageId: string): Promise<void> {
    await axiosInstance.delete(`/api/v1/plans/${planId}/stages/${stageId}`);
  },

  // --- TASK APIs ---

  async getTasks(planId: string, stageId: string): Promise<Task[]> {
    const response = await axiosInstance.get(`/api/v1/plans/${planId}/stages/${stageId}/tasks`);
    const validated = getTasksResponseSchema.parse(response.data);
    return validated.data as Task[];
  },

  async createTask(planId: string, stageId: string, data: { name: string; description: string; startDate: string; endDate: string; plotId: string }): Promise<Task> {
    const response = await axiosInstance.post(`/api/v1/plans/${planId}/stages/${stageId}/tasks`, data);
    const validated = createTaskResponseSchema.parse(response.data);
    return validated.data as Task;
  },

  async updateTask(planId: string, stageId: string, taskId: string, data: Partial<Task>): Promise<Task> {
    const response = await axiosInstance.patch(`/api/v1/plans/${planId}/stages/${stageId}/tasks/${taskId}`, data);
    const validated = createTaskResponseSchema.parse(response.data); // Reuse same schema
    return validated.data as Task;
  },

  async deleteTask(planId: string, stageId: string, taskId: string): Promise<void> {
    await axiosInstance.delete(`/api/v1/plans/${planId}/stages/${stageId}/tasks/${taskId}`);
  }
};
