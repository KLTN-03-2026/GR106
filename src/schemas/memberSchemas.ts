import { z } from 'zod';

export const inviteMemberSchema = z.object({
  email: z.string().trim().min(1, 'Vui lòng nhập địa chỉ email').email('Định dạng email không hợp lệ'),
  roleId: z.string().min(1, 'Vui lòng chọn vai trò'),
});

export const changeRoleSchema = z.object({
  roleId: z.string().min(1, 'Vui lòng chọn vai trò'),
});

export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;
export type ChangeRoleInput = z.infer<typeof changeRoleSchema>;
