import { axiosInstance } from '../../config/axios';
import { ApiResponse } from '../../types/auth';
import { Farm, CreateFarmRequest } from '../../types/farm';

export const farmService = {
  async createFarm(data: CreateFarmRequest): Promise<ApiResponse<Farm>> {
    const response = await axiosInstance.post<ApiResponse<Farm>>(
      '/api/v1/farms',
      data
    );
    return response.data;
  },

  async getMyFarms(): Promise<ApiResponse<Farm[]>> {
    const response = await axiosInstance.get<ApiResponse<Farm[]>>(
      '/api/v1/farms'
    );
    return response.data;
  },

  /**
   * Lấy thông tin tổng quan farm (Dashboard summary)
   * GET /api/v1/farms/summary
   */
  async getFarmSummary(): Promise<ApiResponse<any[]>> {
    const response = await axiosInstance.get<ApiResponse<any[]>>(
      '/api/v1/farms/summary'
    );
    return response.data;
  },

  /**
   * Lấy chi tiết farm
   * [ĐANG CHỜ API] - Hiện chưa có trong tài liệu Backend mới nhất
   */
  async getFarmDetail(id: string): Promise<ApiResponse<Farm>> {
    const response = await axiosInstance.get<ApiResponse<Farm>>(
      `/api/v1/farms/${id}`
    );
    return response.data;
  },

  async selectFarm(farmId: string): Promise<ApiResponse<{ farmToken: string }>> {
    const response = await axiosInstance.post<ApiResponse<{ farmToken: string }>>(
      `/api/v1/farms/${farmId}/select`
    );
    return response.data;
  },

  async updateFarm(farmId: string, data: { name: string; description: string }): Promise<ApiResponse<Farm>> {
    const response = await axiosInstance.patch<ApiResponse<Farm>>(
      `/api/v1/farms/${farmId}`,
      data
    );
    return response.data;
  }
};

