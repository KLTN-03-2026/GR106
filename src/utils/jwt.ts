import { jwtDecode } from 'jwt-decode';
import { RoleId, JwtPayload } from '../types/auth'; // Ensure these are exported from auth.ts
import { getRoleDisplayName } from './roleUtils';

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

export const parseRole = (roles: string[]): RoleId => {
  if (!roles || !Array.isArray(roles)) return 'user';
  
  const upperRoles = roles.map(r => r.toUpperCase());
  
  if (upperRoles.includes('ROLE_ADMIN') || upperRoles.includes('ADMIN')) return 'admin';
  if (upperRoles.includes('ROLE_OWNER') || upperRoles.includes('OWNER')) return 'owner';
  if (upperRoles.includes('ROLE_MANAGER') || upperRoles.includes('MANAGER')) return 'manager';
  if (upperRoles.includes('ROLE_EMPLOYEE') || upperRoles.includes('EMPLOYEE') || upperRoles.includes('ROLE_WORKER') || upperRoles.includes('WORKER')) return 'employee';
  if (upperRoles.includes('ROLE_USER') || upperRoles.includes('USER')) return 'user';
  
  return 'user'; // default to user for safety
};

// Tạo user object từ JWT token bằng cách giải mã các trường thực tế
export const getUserFromToken = (token: string) => {
  const payload = decodeToken(token);
  if (!payload) return null;

  const roles = getRolesFromToken(token);
  const role = parseRole(roles);
  
  // Ưu tiên lấy fullName từ token
  const fullName = payload.fullName || payload.name || getRoleDisplayName(role);
  const email = payload.email || 'user@example.com';

  return {
    id: payload.sub,
    email: email,
    fullName: fullName,
    role: role,
  };
};
