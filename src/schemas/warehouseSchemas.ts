import { z } from "zod";

export const createWarehouseSchema = z.object({
  name: z.string().min(1, "Tên kho không được để trống"),
  description: z.string().optional(),
  address: z.string().min(1, "Vui lòng nhập địa chỉ cụ thể"),
  latitude: z
    .number({ invalid_type_error: "Vui lòng click chọn vị trí trên bản đồ" })
    .min(-90).max(90),
  longitude: z
    .number({ invalid_type_error: "Vui lòng click chọn vị trí trên bản đồ" })
    .min(-180).max(180),
});

export type CreateWarehouseFormValues = z.infer<typeof createWarehouseSchema>;
