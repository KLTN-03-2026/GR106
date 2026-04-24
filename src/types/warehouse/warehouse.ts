export interface Warehouse {
  id: string;
  name: string;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
}

export interface CreateWarehouseRequest {
  name: string;
  description?: string;
  address: string;
  latitude: number;
  longitude: number;
}
