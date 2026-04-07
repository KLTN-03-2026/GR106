// Tiện ích decode JWT và kiểm tra quyền dựa vào payload

export interface JwtPayload {
  sub: string;
  roles: string[];
  iat: number;
  exp: number;
}

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
  return payload?.roles?.includes(role) ?? false;
}
