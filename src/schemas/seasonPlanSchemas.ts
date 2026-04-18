import { z } from 'zod';

// Schema for Status Object
export const statusObjectSchema = z.object({
  id: z.string().uuid(),
  code: z.string(),
  name: z.string(),
  color: z.string(),
});

// Enum for Plan Status (legacy/simple)
export const planStatusSchema = z.enum(['DRAFT', 'ACTIVE', 'READY_TO_HARVEST', 'HARVESTING', 'COMPLETED', 'CANCELLED', 'UNASSIGNED', 'ASSIGNED', 'OVERDUE']);

// Schema for a single Plan from API
export const apiPlanSchema = z.object({
  id: z.string().uuid(),
  farmId: z.string().uuid(),
  clonedFromId: z.string().uuid().nullable().optional(),
  name: z.string(),
  startDate: z.string(), // YYYY-MM-DD
  endDate: z.string(),   // YYYY-MM-DD
  status: z.union([planStatusSchema, statusObjectSchema]),
  note: z.string().nullable().optional(),
  createdById: z.string().uuid().nullable().optional(),
  createdAt: z.string().optional(),
  deletedAt: z.string().nullable().optional(),
  plotId: z.string().uuid().nullable().optional(),
  cropId: z.string().uuid().nullable().optional(),
});

// Schema for Plan Stage (Phase)
export const apiPlanStageSchema = z.object({
  id: z.string().uuid(),
  planId: z.string().uuid(),
  farmId: z.string().uuid().nullable().optional(),
  name: z.string(),
  source: z.enum(['TEMPLATE', 'MANUAL', 'CUSTOM']).optional(),
  orderIndex: z.number().optional(),
  startDate: z.string(),
  endDate: z.string(),
  aiSuggestionCache: z.string().nullable().optional(),
  status: statusObjectSchema,
});

// Schema for Task
export const apiTaskSchema = z.object({
  id: z.string().uuid(),
  planStageId: z.string().uuid(),
  farmId: z.string().uuid().nullable().optional(),
  plotId: z.string().uuid().nullable().optional(),
  status: statusObjectSchema,
  name: z.string(),
  description: z.string().nullable().optional(),
  startDate: z.string(),
  endDate: z.string(),
  progressPercent: z.number().default(0),
  acceptedAt: z.string().nullable().optional(),
  completedAt: z.string().nullable().optional(),
  createdBy: z.string().uuid().optional(),
  createdAt: z.string().optional(),
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
export const getStagesResponseSchema = apiResponseSchema(z.array(apiPlanStageSchema));
export const createStageResponseSchema = apiResponseSchema(apiPlanStageSchema);
export const getTasksResponseSchema = apiResponseSchema(z.array(apiTaskSchema));
export const createTaskResponseSchema = apiResponseSchema(apiTaskSchema);

// Schema cho Payload tạo Plan mới
export const createPlanRequestSchema = z.object({
  cropId: z.string().uuid('Vui lòng chọn cây trồng'),
  plotId: z.string().uuid('Vui lòng chọn lô đất').optional(),
  name: z.string().min(1, 'Tên kế hoạch không được để trống'),
  startDate: z.string().min(1, 'Vui lòng chọn ngày bắt đầu'),
  endDate: z.string().min(1, 'Vui lòng chọn ngày kết thúc'),
  note: z.string().optional(),
});
