import { useAuth } from './useAuth';

/**
 * Hook để kiểm tra quyền truy cập dựa vào role
 * @param allowedRoles Danh sách các role được phép
 * @returns true nếu user có quyền, false nếu không
 */
export const usePermission = (allowedRoles: string | string[]): boolean => {
  const { user } = useAuth();

  if (!user || !user.role) {
    return false;
  }

  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  return roles.includes(user.role);
};

/**
 * Hook để kiểm tra role cụ thể
 */
export const useRole = () => {
  const { user } = useAuth();

  return {
    isOwner: user?.role === 'owner',
    isManager: user?.role === 'manager',
    isEmployee: user?.role === 'employee',
    role: user?.role || null,
  };
};
