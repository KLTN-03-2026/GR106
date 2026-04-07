# ✅ FIXES APPLIED - Loading Fallback & API Structure

## 🔧 Vấn đề đã fix

### 1. ❌ **Vấn đề: Bấm F5 không thấy Loading**

**Nguyên nhân:** App.tsx và AppRoutes không dùng React.lazy + Suspense

**✅ Đã fix:**

#### **App.tsx:**

```tsx
import { Suspense } from "react";
import { LoadingPage } from "./components/ui/LoadingPage";

export function App() {
  return (
    <Suspense fallback={<LoadingPage />}>
      <AppRoutes />
    </Suspense>
  );
}
```

#### **AppRoutes.tsx:**

```tsx
import { Suspense, lazy } from 'react';

// Lazy load tất cả pages
const HomePage = lazy(() => import('../pages/landing/HomePage'));
const LoginPage = lazy(() => import('../pages/Login/LoginPage')...);
// ... tất cả pages khác

// Wrap mỗi route với Suspense
<Route
  path="/login"
  element={<Suspense fallback={<LoadingPage />}><LoginPage /></Suspense>}
/>
```

**Kết quả:**

- ✅ Khi F5 trang → thấy LoadingPage
- ✅ Khi navigate giữa các routes → thấy LoadingPage
- ✅ Code splitting → giảm bundle size

---

### 2. ✅ **API Response Structure đã match với Backend**

#### **Backend Response chuẩn:**

**Login API Response:**

```json
{
  "success": true,
  "code": 0,
  "message": "string",
  "data": {
    "accessToken": "string",
    "refreshToken": "string"
  },
  "timestamp": "2026-04-05T09:32:41.652Z"
}
```

**⚠️ Backend KHÔNG trả user info trong login response!**

#### **Frontend xử lý:**

**TypeScript Types (đã đúng):**

```typescript
export interface ApiResponse<T> {
  success: boolean;
  code: number;
  message: string;
  data: T;
  timestamp: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  // KHÔNG có user info
}
```

**useLogin.ts (đã đúng):**

```typescript
const response = await authService.login(data);
if (response.success) {
  const { accessToken, refreshToken } = response.data;

  // ✅ Decode JWT token để lấy user info
  const user = getUserFromToken(accessToken);

  // ✅ Lưu vào Redux
  dispatch(
    setCredentials({
      accessToken,
      refreshToken,
      user, // Từ JWT decode
    }),
  );
}
```

---

## 🔐 JWT Token Structure Required

Backend JWT token **PHẢI** chứa payload này:

```json
{
  "sub": "user_id", // User ID
  "email": "user@example.com", // Email
  "fullName": "Nguyễn Văn A", // Full name
  "role": "owner", // Role: owner | manager | employee
  "iat": 1234567890, // Issued at
  "exp": 1234567890 // Expiration
}
```

**Frontend decode token:**

```typescript
// src/utils/jwt.ts
import { jwtDecode } from "jwt-decode";

export const getUserFromToken = (token: string) => {
  const payload = jwtDecode<JwtPayload>(token);
  return {
    id: payload.sub,
    email: payload.email,
    fullName: payload.fullName,
    role: payload.role,
  };
};
```

---

## 📊 Complete API Flow

### **Login Flow:**

```
1. User nhập email + password
   ↓
2. POST /api/v1/auth/login
   Request: { email, password }
   ↓
3. Backend trả:
   {
     success: true,
     data: {
       accessToken: "eyJhbGc...",  // JWT với user info
       refreshToken: "xyz..."
     }
   }
   ↓
4. Frontend decode accessToken
   → Lấy { id, email, fullName, role }
   ↓
5. Lưu vào Redux + localStorage
   ↓
6. Redirect dựa vào role:
   - owner → /dashboard/owner
   - manager → /dashboard/manager
   - employee → /dashboard/employee
```

### **Register Flow:**

```
POST /api/v1/auth/register
Request: { email, password, fullName }
Response: { success: true, data: "string" }
```

### **Verify Flow:**

```
POST /api/v1/auth/verify
Request: { token }
Response: { success: true, data: "string" }
```

### **Refresh Token Flow:**

```
POST /api/v1/auth/refresh
Request: { refreshToken }
Response: {
  success: true,
  data: {
    accessToken: "new_token",
    refreshToken: "new_refresh"
  }
}
```

---

## 🎯 Testing Checklist

### Test Loading:

- [ ] Bấm F5 trên `/login` → thấy LoadingPage
- [ ] Navigate từ `/login` → `/register` → thấy LoadingPage
- [ ] Slow 3G network → thấy LoadingPage lâu hơn

### Test JWT Decode:

- [ ] Login với token hợp lệ → decode thành công
- [ ] Check Redux state có `user` { id, email, fullName, role }
- [ ] Check localStorage có `user` object
- [ ] Refresh token → user info được update

### Test Role Routing:

- [ ] Login owner → redirect `/dashboard/owner`
- [ ] Login manager → redirect `/dashboard/manager`
- [ ] Login employee → redirect `/dashboard/employee`

---

## 📁 Files Updated

1. ✅ `src/App.tsx` - Added Suspense wrapper
2. ✅ `src/routes/AppRoutes.tsx` - Lazy load all pages + Suspense each route
3. ✅ `src/hooks/login/useLogin.ts` - Already correct (decode JWT)
4. ✅ `src/types/auth.ts` - Already correct (matches BE)
5. ✅ `src/utils/jwt.ts` - JWT decode utility (đã có)

---

## 🚨 Important Notes

### **Đừng quên:**

1. ✅ Run `npm install jwt-decode` (nếu chưa)
2. ✅ Backend JWT token phải có đủ fields: sub, email, fullName, role
3. ✅ Test với slow network để thấy LoadingPage

### **Nếu vẫn không thấy Loading:**

```bash
# Clear cache + restart dev server
rm -rf node_modules/.vite
npm run dev
```

---

**🎉 Bây giờ F5 sẽ thấy LoadingPage rồi nhé!**
