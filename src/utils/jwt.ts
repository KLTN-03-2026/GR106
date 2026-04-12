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
  return payload?.roles || [];
};

// Parse role từ roles array
export const parseRole = (roles: string[]): RoleId => {
  if (roles.includes('ROLE_ADMIN')) return 'owner';
  if (roles.includes('ROLE_OWNER')) return 'owner';
  if (roles.includes('ROLE_MANAGER')) return 'manager';
  if (roles.includes('ROLE_EMPLOYEE')) return 'employee';
  if (roles.includes('ROLE_WORKER')) return 'employee';
  if (roles.includes('ROLE_USER')) return 'user';
  return 'user'; // default to user for safety
};

// Tạo user object từ JWT token bằng cách giải mã các trường thực tế
export const getUserFromToken = (token: string) => {
  const payload = decodeToken(token);
  if (!payload) return null;

  const role = parseRole(payload.roles);
  
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
