export interface Supplier {
  code: string;
  name: string;
  createdAt: string;
}

export interface CreateSupplierDto {
  supplierCode: string;
  name: string;
}
