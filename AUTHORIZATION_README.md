# JWT-Based Authorization Implementation

## 📦 Installation Required

Chạy lệnh sau để cài đặt thư viện cần thiết:

\`\`\`bash
npm install jwt-decode
\`\`\`

## 🔐 Cách hoạt động

### 1. Login Flow

1. User nhập email + password
2. Backend trả về: `{ accessToken, refreshToken }`
3. Frontend decode `accessToken` để lấy user info (id, email, fullName, role)
4. Lưu vào Redux + localStorage
5. Redirect dựa vào role:
   - `owner` → `/dashboard/owner`
   - `manager` → `/dashboard/manager`
   - `employee` → `/dashboard/employee`

### 2. JWT Token Structure

Token phải chứa payload:
\`\`\`json
{
"sub": "user_id",
"email": "user@example.com",
"fullName": "Nguyễn Văn A",
"role": "owner",
"iat": 1234567890,
"exp": 1234567890
}
\`\`\`

### 3. Role-Based Access Control

#### Routes được bảo vệ:

- `/dashboard/owner` - Chỉ owner
- `/dashboard/manager` - Owner + Manager
- `/dashboard/employee` - Tất cả roles

#### Sử dụng trong component:

\`\`\`typescript
import { usePermission, useRole } from '../hooks/usePermission';

// Kiểm tra quyền
const canDelete = usePermission('owner');
const canEdit = usePermission(['owner', 'manager']);

// Kiểm tra role
const { isOwner, isManager, isEmployee } = useRole();

// Hiển thị có điều kiện
{canDelete && <DeleteButton />}
{isOwner && <AdminPanel />}
\`\`\`

## 📁 Files Created

1. `src/utils/jwt.ts` - JWT decode utilities
2. `src/routes/RoleRoute.tsx` - Role-based route guard
3. `src/pages/Dashboard/OwnerDashboardPage.tsx` - Owner dashboard
4. `src/pages/Dashboard/ManagerDashboardPage.tsx` - Manager dashboard
5. `src/pages/Dashboard/EmployeeDashboardPage.tsx` - Employee dashboard
6. `src/pages/landing/UnauthorizedPage.tsx` - 403 page
7. `src/hooks/usePermission.ts` - Permission hooks
8. Updated: `src/hooks/login/useLogin.ts` - Decode token on login
9. Updated: `src/config/axios.ts` - Update user after refresh token
10. Updated: `src/routes/AppRoutes.tsx` - Role-based routing

## 🎯 Testing

### Test các roles:

1. Login với user có role `owner`
2. Kiểm tra redirect → `/dashboard/owner`
3. Thử truy cập `/dashboard/manager` → OK
4. Thử truy cập `/dashboard/employee` → OK

### Test unauthorized:

1. Login với user có role `employee`
2. Thử truy cập `/dashboard/owner` → Redirect `/unauthorized`

## 🚀 Next Steps

1. Run `npm install jwt-decode`
2. Build project: `npm run build`
3. Start dev server: `npm run dev`
4. Test login với các roles khác nhau
