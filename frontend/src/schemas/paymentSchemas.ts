import { z } from 'zod';

export const executePaymentSchema = z.object({
  selectedPlan: z.string().min(1, 'Vui lòng chọn gói đăng ký'),
  farmId: z.string().min(1, 'Không xác định được trang trại cần nâng cấp. Vui lòng quay lại trang quản lý.'),
});

export type ExecutePaymentInput = z.infer<typeof executePaymentSchema>;
