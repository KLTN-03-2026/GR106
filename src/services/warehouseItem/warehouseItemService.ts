import { axiosInstance } from '../../config/axios';
import { CreateWarehouseItemDto, WarehouseItem } from '../../types/warehouseItem/warehouseItem';
import { Warehouse } from '../../types/warehouse/warehouse';

export const warehouseItemService = {
  async getFarmWarehouses(farmId: string): Promise<Warehouse[]> {
    const response = await axiosInstance.get(`/api/v1/farms/${farmId}/warehouses`);
    return response.data.data ?? [];
  },

  async getWarehouseItems(farmId: string, warehouseId: string): Promise<WarehouseItem[]> {
    const response = await axiosInstance.get(`/api/v1/farms/${farmId}/warehouses/${warehouseId}/items`);
    return response.data.data ?? [];
  },

  async getFarmWarehouseItems(farmId: string): Promise<WarehouseItem[]> {
    const response = await axiosInstance.get(`/api/v1/farms/${farmId}/warehouses/items`);
    return response.data.data ?? [];
  },

  async createWarehouseItem(
    farmId: string,
    warehouseId: string,
    itemData: CreateWarehouseItemDto,
  ): Promise<WarehouseItem> {
    const response = await axiosInstance.post(`/api/v1/farms/${farmId}/warehouses/${warehouseId}/items`, itemData);
    return response.data.data;
  },
};

