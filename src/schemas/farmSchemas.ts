import { z } from 'zod';

// Schema cho dữ liệu trả về của một Farm
export const farmResponseSchema = z.object({
  id: z.string().uuid(),
  ownerId: z.string().uuid(),
  name: z.string(),
  description: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// Schema cho dữ liệu trả về của API GET /api/v1/farms
export const getFarmsResponseSchema = z.object({
  success: z.boolean(),
  code: z.number(),
  message: z.string(),
  data: z.array(farmResponseSchema),
  timestamp: z.string().datetime(),
});

// Schema cho dữ liệu trả về của API GET /api/v1/farms/summary
export const farmSummarySchema = z.object({
  farmId: z.string().uuid(),
  farmName: z.string(),
  description: z.string(),
  ownerId: z.string().uuid(),
  ownerFullName: z.string(),
  ownerAvatarUrl: z.string().nullable().optional(),
  myRole: z.string(),
  owner: z.boolean(),
});

export const getFarmsSummaryResponseSchema = z.object({
  success: z.boolean(),
  code: z.number(),
  message: z.string(),
  data: z.array(farmSummarySchema),
  timestamp: z.string().datetime(),
});

// Schema cho dữ liệu gửi đi khi tạo Farm mới (POST /api/v1/farm)
export const createFarmSchema = z.object({
  farmName: z.string().min(1, 'Tên farm không được để trống'),
  description: z.string().optional(),
});

export const createFarmResponseSchema = z.object({
  success: z.boolean(),
  code: z.number(),
  message: z.string(),
  data: farmResponseSchema,
  timestamp: z.string().datetime(),
});

export type FarmResponse = z.infer<typeof farmResponseSchema>;
export type FarmSummary = z.infer<typeof farmSummarySchema>;
export type CreateFarmInput = z.infer<typeof createFarmSchema>;
