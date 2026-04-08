import { jwtDecode } from 'jwt-decode';
import { RoleId } from './roleUtils';

export interface JwtPayload {
  sub: string; // user ID
  roles: string[]; // Array of roles: ["ROLE_USER", "ROLE_OWNER", etc.]
  fullName?: string; // Họ tên thực tế từ Backend
  name?: string;     // Tên dự phòng từ Backend
  email?: string;    // Email thực tế
  iat?: number;
  exp?: number;
}

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

// Helper: Tạo display name dựa vào role (dự phòng)
const getRoleDisplayName = (role: string): string => {
  switch (role) {
    case 'owner': return 'Chủ trang trại';
    case 'manager': return 'Người quản lý trang trại';
    case 'employee': return 'Nhân công';
    default: return 'Người dùng';
  }
};
