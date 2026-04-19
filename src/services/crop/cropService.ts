import { axiosInstance } from '../../config/axios';
import { ApiResponse } from '../../types/auth';
import { Crop, CropType, CreateCropRequest, CreateCropTypeRequest } from '../../types/crop';

/**
 * Service Quản lý danh mục cây trồng (Admin - PB10)
 * Đồng bộ theo API Backend thực tế
 */
export const cropService = {

  // ──────────────────────────────────────────────
  // CROP TYPES
  // ──────────────────────────────────────────────

  /**
   * Lấy danh sách loại cây trồng
   * GET /api/v1/crop-types
   */
  async getCropTypes(): Promise<ApiResponse<CropType[]>> {
    const response = await axiosInstance.get<ApiResponse<CropType[]>>('/api/v1/crop-types');
    return response.data;
  },

  /**
   * Tạo loại cây trồng mới
   * POST /api/v1/crop-type
   * [ADMIN ONLY] - Yêu cầu quyền ROLE_ADMIN
   */
  async createCropType(data: CreateCropTypeRequest): Promise<ApiResponse<CropType>> {
    const response = await axiosInstance.post<ApiResponse<CropType>>('/api/v1/crop-type', data);
    return response.data;
  },

  /**
   * Xóa loại cây trồng
   * DELETE /api/v1/crop-type/{cropTypeId}
   * [ADMIN ONLY]
   */
  async deleteCropType(cropTypeId: string): Promise<ApiResponse<string>> {
    const response = await axiosInstance.delete<ApiResponse<string>>(`/api/v1/crop-type/${cropTypeId}`);
    return response.data;
  },

  // ──────────────────────────────────────────────
  // CROPS
  // ──────────────────────────────────────────────

  /**
   * Tạo cây trồng hệ thống mới (Scope SYSTEM)
   * POST /api/v1/crops
   * [ADMIN ONLY]
   */
  async createCrop(data: CreateCropRequest): Promise<ApiResponse<Crop>> {
    const response = await axiosInstance.post<ApiResponse<Crop>>('/api/v1/crops', data);
    return response.data;
  },

  /**
   * Lấy danh sách cây trồng hệ thống
   * GET /api/v1/crops (Scope SYSTEM)
   */
  async getCrops(): Promise<ApiResponse<Crop[]>> {
    const response = await axiosInstance.get<ApiResponse<Crop[]>>('/api/v1/crops');
    return response.data;
  },
};
