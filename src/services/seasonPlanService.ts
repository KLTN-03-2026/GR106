import { axiosInstance } from '../config/axios';
import { SeasonPlan, CreateSeasonPlanRequest } from '../types/seasonPlan';
import { getPlansResponseSchema, createPlanResponseSchema } from '../schemas/seasonPlanSchemas';

/**
 * Service Quản lý kế hoạch sản xuất (Season Plan)
 * Đồng bộ theo API Backend: /api/v1/plans
 */
export const seasonPlanService = {
  /**
   * Lấy danh sách kế hoạch của farm hiện tại
   * GET /api/v1/plans
   */
  async getPlans(): Promise<SeasonPlan[]> {
    const response = await axiosInstance.get('/api/v1/plans');
    const validated = getPlansResponseSchema.parse(response.data);
    
    // Map API data back to frontend SeasonPlan type if needed
    // (Backend snippet doesn't show phases, we might need to handle that)
    return validated.data.map(plan => ({
      ...plan,
      plotId: plan.plotId || '',
      cropId: plan.cropId || '',
      phases: [], // API chưa trả về phases, sẽ được xử lý ở tầng store hoặc generator
      description: plan.note || '',
    })) as SeasonPlan[];
  },

  /**
   * Tạo kế hoạch mới
   * POST /api/v1/plans
   */
  async createPlan(data: CreateSeasonPlanRequest): Promise<SeasonPlan> {
    // Chuyển đổi từ frontend request sang backend request nếu cần
    const payload = {
      name: data.name,
      cropId: data.cropId,
      startDate: data.startDate,
      endDate: (data as any).endDate || data.startDate, // Backend yêu cầu endDate
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
  }
};
