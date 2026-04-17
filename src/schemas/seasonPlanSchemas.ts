import { z } from 'zod';

// Enum for Plan Status
export const planStatusSchema = z.enum(['DRAFT', 'ACTIVE', 'READY_TO_HARVEST', 'HARVESTING', 'COMPLETED', 'CANCELLED']);

// Schema for a single Plan from API
export const apiPlanSchema = z.object({
  id: z.string().uuid(),
  farmId: z.string().uuid(),
  clonedFromId: z.string().uuid().nullable().optional(),
  name: z.string(),
  startDate: z.string(), // YYYY-MM-DD
  endDate: z.string(),   // YYYY-MM-DD
  status: planStatusSchema,
  note: z.string().nullable().optional(),
  createdById: z.string().uuid().nullable().optional(),
  createdAt: z.string().optional(),
  deletedAt: z.string().nullable().optional(),
  // Phụ trợ thêm nếu có (mặc dù snippet không có nhưng thường sẽ cần)
  plotId: z.string().uuid().optional(),
  cropId: z.string().uuid().optional(),
});

// Schema cho API Response
export const apiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    code: z.number(),
    message: z.string(),
    data: dataSchema,
    timestamp: z.string(),
  });

export const getPlansResponseSchema = apiResponseSchema(z.array(apiPlanSchema));
export const createPlanResponseSchema = apiResponseSchema(apiPlanSchema);

// Schema cho Payload tạo Plan mới
export const createPlanRequestSchema = z.object({
  cropId: z.string().uuid('Vui lòng chọn cây trồng'),
  plotId: z.string().uuid('Vui lòng chọn lô đất').optional(), // Thêm optional nếu API chưa hỗ trợ nhưng UI cần
  name: z.string().min(1, 'Tên kế hoạch không được để trống'),
  startDate: z.string().min(1, 'Vui lòng chọn ngày bắt đầu'),
  endDate: z.string().min(1, 'Vui lòng chọn ngày kết thúc'),
  note: z.string().optional(),
});
