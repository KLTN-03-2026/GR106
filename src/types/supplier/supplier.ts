export interface Supplier {
  id: string
  code: string;
  name: string;
  createdAt: string;
}

export interface CreateSupplierDto {
  supplierCode: string;
  name: string;
}
