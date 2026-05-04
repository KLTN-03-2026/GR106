import { z } from "zod";
import { apiResponseSchema } from "./seasonPlanSchemas";

export const warehouseSchema = z.object({
  id: z.string().uuid(),
  version: z.number().optional(),
  name: z.string(),
  description: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
});

export const createWarehouseSchema = z.object({
  name: z.string().min(1, "Tên kho không được để trống"),
  
});

export const getWarehousesResponseSchema = apiResponseSchema(z.array(warehouseSchema));

export type CreateWarehouseFormValues = z.infer<typeof createWarehouseSchema>;
