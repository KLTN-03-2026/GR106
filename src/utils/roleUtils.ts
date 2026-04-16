/**
 * Tiện ích quản lý vai trò trong hệ thống FarmerAI
 * Giúp đồng bộ hóa tên hiển thị tiếng Việt theo tài liệu nghiệp vụ
 */
import { RoleId } from '../types/auth';

export const ROLE_DISPLAY_NAMES: Record<RoleId, string> = {
  owner: 'Chủ trang trại',
  manager: 'Người quản lý trang trại',
  employee: 'Nhân công',
  user: 'Người dùng mới',
  admin: 'Quản trị viên',
};

/**
 * Lấy tên hiển thị tiếng Việt của một vai trò
 */
export const getRoleDisplayName = (role: string | undefined): string => {
  if (!role) return 'Người dùng';
  
  // Xử lý cả trường hợp dùng 'worker' thay vì 'employee'
  const normalizedRole = role === 'worker' ? 'employee' : role;
  
  return ROLE_DISPLAY_NAMES[normalizedRole as RoleId] || role;
};
