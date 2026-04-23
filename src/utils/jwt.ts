import { jwtDecode } from 'jwt-decode';
import { RoleId, JwtPayload } from '../types/auth/auth';

export const decodeToken = (token: string): JwtPayload | null => {
  try {
    const decoded = jwtDecode<JwtPayload>(token);
    return decoded;
  } catch (error) {
    console.error('Error decoding JWT token:', error);
    return null;
  }
};

export const getUserIdFromToken = (token: string): string | null => {
  const payload = decodeToken(token);
  return payload?.sub || null;
};

export const getRolesFromToken = (token: string): string[] => {
  const payload = decodeToken(token);
  if (!payload) return [];
  
  // Check multiple common field names for roles/authorities
  const rawRoles = payload.roles || payload.authorities || payload.role || [];
  
  if (Array.isArray(rawRoles)) {
    return rawRoles.map(r => String(r));
  }
  
  if (typeof rawRoles === 'string') {
    return rawRoles.split(',').map(r => r.trim()).filter(Boolean);
  }
  
  return [];
};

export const parseRole = (roles: string[], perms?: string[], farmRole?: string): RoleId => {
  const upperRoles = (roles || []).map(r => r.toUpperCase());
  
  // Ưu tiên 1: Đọc farmRole trực tiếp từ farmToken (backend đặt rõ ràng)
  if (farmRole) {
    const fr = farmRole.toUpperCase();
    if (fr === 'OWNER') return 'owner';
    if (fr === 'MANAGER') return 'manager';
    if (fr === 'EMPLOYEE' || fr === 'WORKER') return 'employee';
  }

  // Ưu tiên 2: Role system-level (ROLE_ADMIN, ROLE_OWNER)
  if (upperRoles.includes('ROLE_ADMIN') || upperRoles.includes('ADMIN')) return 'admin';
  if (upperRoles.includes('ROLE_OWNER') || upperRoles.includes('OWNER')) return 'owner';
  
  // Ưu tiên 3: Suy ra role từ permissions (ABAC fallback)
  if (perms && perms.length > 0) {
    if (perms.includes('farm:delete') || perms.includes('farm:update') || perms.includes('member:invite')) {
      return 'owner';
    }
    if (perms.includes('task:assign') || perms.includes('plan:create')) {
      return 'manager';
    }
    // Manager chỉ có plan:read nhưng không có plan:create
    if (perms.includes('plan:read') && !perms.includes('plan:create')) {
      return 'manager';
    }
  }

  // Ưu tiên 4: Role cứng trong token
  if (upperRoles.includes('ROLE_MANAGER') || upperRoles.includes('MANAGER')) return 'manager';
  if (upperRoles.includes('ROLE_EMPLOYEE') || upperRoles.includes('EMPLOYEE') || upperRoles.includes('ROLE_WORKER') || upperRoles.includes('WORKER')) return 'employee';
  
  return 'user';
};

// Tạo user object từ JWT token bằng cách giải mã các trường thực tế
export const getUserFromToken = (token: string) => {
  const payload = decodeToken(token);
  if (!payload) return null;

  const roles = getRolesFromToken(token);
  const perms = payload.perms || payload.permissions || [];
  const farmRole = payload.farmRole; // Field đặc biệt trong farmToken từ Backend
  const role = parseRole(roles, perms, farmRole);
  
  const fullName = payload.fullName || payload.name || payload.email || 'Thành viên';
  const email = payload.email || 'user@example.com';

  return {
    id: payload.sub,
    email: email,
    fullName: fullName,
    role: role,
    perms: perms
  };
};
