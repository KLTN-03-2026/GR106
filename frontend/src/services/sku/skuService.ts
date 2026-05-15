import { axiosInstance } from '../../config/axios';
import { CreateSkuDto, Sku } from '../../types/sku/sku';

export const skuService = {
  async getSkus(farmId: string): Promise<Sku[]> {
    const response = await axiosInstance.get(`/api/v1/farms/${farmId}/skus`);
    return response.data.data ?? [];
  },

  async createSku(farmId: string, data: CreateSkuDto): Promise<Sku> {
    const response = await axiosInstance.post(`/api/v1/farms/${farmId}/skus`, data);
    return response.data.data;
  },

  async deleteSku(farmId: string, sku: string): Promise<void> {
    await axiosInstance.delete(`/api/v1/farms/${farmId}/skus/${sku}`);
  },
};

