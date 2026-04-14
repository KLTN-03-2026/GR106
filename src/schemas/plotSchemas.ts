import { z } from 'zod';

// Schema cho GeoJSON Geometry
export const geometrySchema = z.object({
  type: z.string().default('Polygon'),
  coordinates: z.array(z.array(z.array(z.number()))),
});

// Schema cho một Plot đơn lẻ

// có thê vẽ or không
export const plotSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  areaHa: z.number().optional().nullable(),
  status: z.enum(['ACTIVE', 'INACTIVE']),
  description: z.string().optional().nullable(),
  geometry: geometrySchema.optional().nullable(),
});

// Schema cho Payload tạo Plot mới
export const createPlotSchema = z.object({
  plotName: z.string().min(1, 'Tên lô đất không được để trống'),
  geometry: geometrySchema.optional().nullable(),
  description: z.string().optional().nullable(),
});

// Base Response Schema
export const apiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) => 
  z.object({
    success: z.boolean(),
    code: z.number(),
    message: z.string(),
    data: dataSchema,
    timestamp: z.string(),
  });

// Specific Response Schemas
export const getPlotsResponseSchema = apiResponseSchema(z.array(plotSchema));
export const createPlotResponseSchema = apiResponseSchema(plotSchema);
