import { axiosInstance } from '../config/axios';
import { ApiResponse } from '../types/auth';

export interface Farm {
  id: string;
  name: string;
  address?: string;
  totalArea?: number;
  description?: string;
  ownerId: string;
  status: 'ACTIVE' | 'INACTIVE';
  memberCount: number;
  plotCount: number;
}

export interface CreateFarmRequest {
  name: string;
  address?: string;
  totalArea?: number;
  description?: string;
}

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
      '/api/v1/farms/my-farms'
    );
    return response.data;
  },

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
  }
};
