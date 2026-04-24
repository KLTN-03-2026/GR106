export interface Sku {
  sku: string;
  description: string;
  createdAt: string;
}

export interface CreateSkuDto {
  sku: string;
  description: string;
}
