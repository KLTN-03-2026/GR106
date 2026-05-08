import { axiosInstance } from '../../config/axios';
import { SeasonPlan, CreateSeasonPlanRequest } from '../../types/seasonPlan';
import type {
  PlanStageStatusHistory,
  StatusObject,
  PlanStageStatusTransition,
} from '../../types/seasonPlan';
import {
  getPlansResponseSchema,
  createPlanResponseSchema,
  getPlanPlotsResponseSchema,
  addPlanPlotsResponseSchema,
  updateStageStatusResponseSchema,
  getStageStatusHistoriesResponseSchema,
  getAvailableStatusesResponseSchema,
  getAllPlanStageStatusesResponseSchema,
  getPlanStageStatusTransitionsResponseSchema,
} from '../../schemas/seasonPlanSchemas';

/**
 * Service Quản lý kế hoạch sản xuất (Season Plan) & Công việc (Task)
 * Đồng bộ theo API Backend: /api/v1/plans
 */
export const seasonPlanService = {
  async getPlans(): Promise<SeasonPlan[]> {
    const response = await axiosInstance.get('/api/v1/plans');
    const validated = getPlansResponseSchema.parse(response.data);

    return validated.data.map(plan => ({
      ...plan,
      phases: [],
      description: plan.note || '',
    })) as SeasonPlan[];
  },

  /**
   * Lấy chi tiết một kế hoạch
   */
  async getPlanById(planId: string): Promise<SeasonPlan> {
    const response = await axiosInstance.get(`/api/v1/plans/${planId}`);
    const validated = createPlanResponseSchema.parse(response.data);

    return {
      ...validated.data,
      phases: [],
      description: validated.data.note || '',
    } as SeasonPlan;
  },

  /**
   * Tạo kế hoạch mới
   */
  async createPlan(data: CreateSeasonPlanRequest): Promise<SeasonPlan> {
    const payload = {
      name: data.name,
      cropId: data.cropId,
      startDate: data.startDate,
      endDate: data.endDate || data.startDate,
      note: data.note || '',
    };

    const response = await axiosInstance.post('/api/v1/plans', payload);
    const validated = createPlanResponseSchema.parse(response.data);

    return {
      ...validated.data,
      phases: [],
      description: validated.data.note || '',
    } as SeasonPlan;
  },

  /**
   * Lấy danh sách lô đất của kế hoạch
   */
  async getPlanPlots(planId: string): Promise<{ plotId: string; plotName: string }[]> {
    const response = await axiosInstance.get(`/api/v1/plans/${planId}/plots`);
    const validated = getPlanPlotsResponseSchema.parse(response.data);
    return validated.data;
  },

  /**
   * Thêm lô đất vào kế hoạch
   */
  async addPlotsToPlan(planId: string, plotIds: string[]): Promise<any> {
    const response = await axiosInstance.post(`/api/v1/plans/${planId}/plots`, { plotIds });
    return addPlanPlotsResponseSchema.parse(response.data).data;
  },




  /**
   * Cập nhật thông tin kế hoạch
   */
  async updatePlan(planId: string, _data: Partial<SeasonPlan>): Promise<SeasonPlan> {
    // API hiện tại không có PATCH /plans/{planId}; chỉ hỗ trợ PUT /plans/{planId}/time cho timeline.
    // Giữ method để tránh phá vỡ call-site cũ, nhưng chặn gọi endpoint sai theo tài liệu API.
    throw new Error(
      `Plan update for ${planId} is not supported by PATCH endpoint. Use updatePlanTime (PUT /api/v1/plans/{planId}/time).`
    );
  },

  /**
   * Cập nhật thời gian kế hoạch (PUT /api/v1/plans/{planId}/time)
   */
  async updatePlanTime(planId: string, data: { startDate: string; endDate: string; version?: number }): Promise<SeasonPlan> {
    const response = await axiosInstance.put(`/api/v1/plans/${planId}/time`, data);
    const validated = createPlanResponseSchema.parse(response.data);
    return {
      ...validated.data,
      phases: [], // Response usually doesn't have phases
      description: validated.data.note || '',
    } as SeasonPlan;
  },

   /**
    * Xóa kế hoạch
    */
   async deletePlan(planId: string): Promise<void> {
     await axiosInstance.delete(`/api/v1/plans/${planId}`);
   },

   /**
    * PUT /api/v1/plans/{planId}/stages/{stageId}/status/{statusId}
    * Cập nhật trạng thái Plan Stage
    */
   async updateStageStatus(
     planId: string,
     stageId: string,
     statusId: string
   ): Promise<PlanStageStatusHistory> {
     const response = await axiosInstance.put(
       `/api/v1/plans/${planId}/stages/${stageId}/status/${statusId}`
     );
     const validated = updateStageStatusResponseSchema.parse(response.data);
     return validated.data;
   },

   /**
    * GET /api/v1/plans/{planId}/stages/{stageId}/status-histories
    * Lấy lịch sử thay đổi trạng thái của Plan Stage
    */
   async getStageStatusHistories(planId: string, stageId: string): Promise<PlanStageStatusHistory[]> {
     const response = await axiosInstance.get(
       `/api/v1/plans/${planId}/stages/${stageId}/status-histories`
     );
     const validated = getStageStatusHistoriesResponseSchema.parse(response.data);
     return validated.data;
   },

   /**
    * GET /api/v1/plans/{planId}/stages/{stageId}/available-statuses
    * Lấy danh sách trạng thái tiếp theo hợp lệ
    */
   async getAvailableStatuses(planId: string, stageId: string): Promise<StatusObject[]> {
     const response = await axiosInstance.get(
       `/api/v1/plans/${planId}/stages/${stageId}/available-statuses`
     );
     const validated = getAvailableStatusesResponseSchema.parse(response.data);
     return validated.data;
   },

   /**
    * GET /api/v1/plan-stage-statuses
    * Lấy tất cả Plan Stage Status (danh sách master)
    */
   async getAllPlanStageStatuses(): Promise<StatusObject[]> {
     const response = await axiosInstance.get('/api/v1/plan-stage-statuses');
     const validated = getAllPlanStageStatusesResponseSchema.parse(response.data);
     return validated.data;
   },

   /**
    * GET /api/v1/plan-stage-status-transitions
    * Lấy các transition trạng thái hợp lệ theo Farm
    */
   async getPlanStageStatusTransitions(): Promise<PlanStageStatusTransition[]> {
     const response = await axiosInstance.get('/api/v1/plan-stage-status-transitions');
     const validated = getPlanStageStatusTransitionsResponseSchema.parse(response.data);
     return validated.data;
   },
 };
