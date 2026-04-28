import { z } from 'zod';

export const createWarehouseItemSchema = z.object({
  name: z.string().trim().min(1, 'Vui lòng nhập tên vật tư'),
  unitId: z.string().min(1, 'Vui lòng chọn đơn vị tính'),
  stock: z.number().min(0, 'Số lượng tồn kho phải lớn hơn hoặc bằng 0'),
  sku: z.string().min(1, 'Vui lòng chọn mã SKU'),
  supplierId: z.string().optional(),
  unitPrice: z.number().min(0, 'Đơn giá phải lớn hơn hoặc bằng 0').optional(),
  minStockQty: z.number().min(0, 'Tồn kho tối thiểu phải lớn hơn hoặc bằng 0').optional(),
  toLocationId: z.string().min(1, 'Vui lòng chọn vị trí kho'),
});

export type CreateWarehouseItemInput = z.infer<typeof createWarehouseItemSchema>;
