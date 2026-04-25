import { z } from 'zod';

export const createSkuSchema = z.object({
  sku: z.string().trim().min(1, 'Vui lòng nhập mã SKU').regex(/^\S+$/, 'Mã SKU không được chứa khoảng trắng'),
  description: z.string().optional(),
});

export type CreateSkuInput = z.infer<typeof createSkuSchema>;
