import { jwtDecode } from 'jwt-decode';

export interface JwtPayload {
  sub: string; // user ID
  roles: string[]; // Array of roles: ["ROLE_USER", "ROLE_OWNER", etc.]
  iat?: number; // issued at
  exp?: number; // expiration time
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

export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwtDecode<JwtPayload>(token);
    if (!decoded.exp) return false;
    
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  } catch (error) {
    return true;
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
// ROLE_OWNER → owner
// ROLE_MANAGER → manager
// ROLE_USER → employee
export const parseRole = (roles: string[]): string => {
  if (roles.includes('ROLE_ADMIN')) return 'owner';
  if (roles.includes('ROLE_OWNER')) return 'owner';
  if (roles.includes('ROLE_MANAGER')) return 'manager';
  if (roles.includes('ROLE_USER')) return 'employee';
  if (roles.includes('ROLE_EMPLOYEE')) return 'employee';
  return 'employee'; // default
};

// Tạo user object từ JWT token
// ⚠️ JWT chỉ có sub và roles, email/fullName là MOCK data
export const getUserFromToken = (token: string) => {
  const payload = decodeToken(token);
  if (!payload) return null;

  const role = parseRole(payload.roles);
  
  // ⚠️ MOCK email và fullName vì JWT không có
  // TODO: Yêu cầu Backend thêm email, fullName vào JWT payload
  return {
    id: payload.sub,
    email: 'user@example.com', // ⚠️ MOCK - cần BE thêm vào JWT
    fullName: getRoleDisplayName(role), // ⚠️ MOCK - cần BE thêm vào JWT
    role: role,
  };
};

// Helper: Tạo display name dựa vào role (tạm thời)
const getRoleDisplayName = (role: string): string => {
  switch (role) {
    case 'owner': return 'Chủ Trang Trại';
    case 'manager': return 'Quản Lý';
    case 'employee': return 'Nhân Viên';
    default: return 'User';
  }
};
