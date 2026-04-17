// Tiện ích decode JWT và kiểm tra quyền dựa vào payload

import { JwtPayload } from '../types/auth/auth.ts';

// Decode JWT không dùng thư viện ngoài
export function decodeToken(token: string): JwtPayload | null {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    return decoded as JwtPayload;
  } catch {
    return null;
  }
}

export function hasRole(token: string, role: string): boolean {
  const payload = decodeToken(token);
  if (!payload) return false;
  
  const roles = payload.roles || payload.authorities || (payload.role ? [payload.role] : []);
  const normalizedRoles = Array.isArray(roles) ? roles.map(r => r.toUpperCase()) : [];
  return normalizedRoles.includes(role.toUpperCase());
}
