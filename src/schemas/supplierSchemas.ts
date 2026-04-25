import { z } from 'zod';

export const createSupplierSchema = z.object({
  supplierCode: z.string().trim().min(1, 'Vui lòng nhập mã nhà cung cấp'),
  name: z.string().trim().min(1, 'Vui lòng nhập tên nhà cung cấp'),
});

export type CreateSupplierInput = z.infer<typeof createSupplierSchema>;
