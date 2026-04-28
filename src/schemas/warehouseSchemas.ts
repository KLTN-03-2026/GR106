import { z } from "zod";

export const createWarehouseSchema = z.object({
  name: z.string().min(1, "Tên kho không được để trống"),
  description: z.string().optional(),
  address: z.string().optional(),
  latitude: z
    .number({ invalid_type_error: "Vui lòng click chọn vị trí trên bản đồ" })
    .min(-90).max(90).optional(),
  longitude: z
    .number({ invalid_type_error: "Vui lòng click chọn vị trí trên bản đồ" })
    .min(-180).max(180).optional(),
});

export type CreateWarehouseFormValues = z.infer<typeof createWarehouseSchema>;
