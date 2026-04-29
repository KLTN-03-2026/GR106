export interface Warehouse {
  id: string;
  name: string;
  description?: string | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

export interface CreateWarehouseRequest {
  name: string;
  description?: string;
  address: string;
  latitude: number;
  longitude: number;
}
