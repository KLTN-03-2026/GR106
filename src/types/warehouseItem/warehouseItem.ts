export interface WarehouseItem {
  id: string;
  name: string;
  warehouse: {
    id: string;
    name: string;
    description: string;
    address: string;
    latitude: number;
    longitude: number;
  };
  unit: {
    id: string;
    code: string;
    name: string;
  };
  supplier: {
    code: string;
    name: string;
    createdAt: string;
  };
  sku: {
    sku: string;
    description: string;
    createdAt: string;
  };
  createdBy: {
    id: string;
    fullName: string;
    email: string;
  };
  createdAt: string;
}

export interface CreateWarehouseItemDto {
  unitId: string;
  name: string;
  sku: string;
  unitPrice: number;
  supplierCode: string;
  minStockQty: number;
}
