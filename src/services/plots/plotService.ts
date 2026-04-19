import { axiosInstance } from '../../config/axios';
import { Plot, CreatePlotInput, UpdatePlotInput } from '../../types/plot/plot';
import {
  getPlotsResponseSchema,
  createPlotResponseSchema,
  updatePlotResponseSchema
} from '../../schemas/plotSchemas';

/**
 * Service Quản lý lô đất (Plot)
 * Đồng bộ theo API Backend: /api/v1/plots
 */
export const plotService = {
  /**
   * Lấy danh sách lô đất của farm hiện tại
   */
  async getPlots(): Promise<Plot[]> {
    const response = await axiosInstance.get('/api/v1/plots');
    return getPlotsResponseSchema.parse(response.data).data;
  },

  /**
   * Tạo lô đất mới
   */
  async createPlot(data: CreatePlotInput): Promise<Plot> {
    const response = await axiosInstance.post('/api/v1/plots', data);
    return createPlotResponseSchema.parse(response.data).data;
  },

  /**
   * Cập nhật thông tin lô đất
   */
  async updatePlot(plotId: string, data: UpdatePlotInput): Promise<Plot> {
    const response = await axiosInstance.patch(`/api/v1/plots/${plotId}`, data);
    return updatePlotResponseSchema.parse(response.data).data;
  },

  /**
   * Xóa lô đất
   */
  async deletePlot(plotId: string): Promise<void> {
    await axiosInstance.delete(`/api/v1/plots/${plotId}`);
  }
};
