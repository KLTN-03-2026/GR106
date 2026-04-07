# 🚨 YÊU CẦU BACKEND - API /user/me

## ⚠️ Vấn đề hiện tại

JWT payload chỉ có:

```json
{
  "sub": "75ffb0c2-efef-4593-adfd-8c4515f1079d",
  "roles": ["ROLE_USER"],
  "iat": 1775540081,
  "exp": 1775543681
}
```

**THIẾU:** email, fullName, role cụ thể

---

## ✅ GIẢI PHÁP: Backend cần thêm endpoint

### **Endpoint mới:**

```
GET /api/v1/user/me
hoặc
GET /api/v1/auth/me
```

### **Headers:**

```
Authorization: Bearer {accessToken}
```

### **Response:**

```json
{
  "success": true,
  "code": 0,
  "message": "OK",
  "data": {
    "id": "75ffb0c2-efef-4593-adfd-8c4515f1079d",
    "email": "user@example.com",
    "fullName": "Nguyễn Văn A",
    "role": "owner" // hoặc "manager", "employee"
  },
  "timestamp": "2026-04-07T05:30:00.000Z"
}
```

---

## 🔄 MAPPING ROLES

Backend có thể map từ `roles` array:

| Backend roles       | Frontend role |
| ------------------- | ------------- |
| `["ROLE_OWNER"]`    | `"owner"`     |
| `["ROLE_MANAGER"]`  | `"manager"`   |
| `["ROLE_USER"]`     | `"employee"`  |
| `["ROLE_EMPLOYEE"]` | `"employee"`  |

**Code ví dụ (Spring Boot):**

```java
@GetMapping("/api/v1/user/me")
public ResponseEntity<ApiResponse<UserInfo>> getMe(Authentication auth) {
    User user = userService.findByUsername(auth.getName());

    String role = "employee"; // default
    if (user.getRoles().contains("ROLE_OWNER")) {
        role = "owner";
    } else if (user.getRoles().contains("ROLE_MANAGER")) {
        role = "manager";
    }

    UserInfo userInfo = new UserInfo(
        user.getId(),
        user.getEmail(),
        user.getFullName(),
        role
    );

    return ResponseEntity.ok(
        ApiResponse.success(userInfo)
    );
}
```

---

## 📊 FLOW Frontend mới

```
1. User login (email + password)
   ↓
2. POST /api/v1/auth/login
   Response: { accessToken, refreshToken }
   ↓
3. Lưu tokens vào localStorage
   ↓
4. GET /api/v1/user/me (với Authorization header)
   Response: { id, email, fullName, role }
   ↓
5. Lưu user info vào Redux
   ↓
6. Redirect dựa vào role:
   - owner → /dashboard/owner
   - manager → /dashboard/manager
   - employee → /dashboard/employee
```

---

## 🔐 Security

**Endpoint /me cần:**

- ✅ Require authentication (JWT token)
- ✅ Return user info của chính user đang login (không cho phép query user khác)
- ✅ Validate token before returning data

**Example Security:**

```java
@PreAuthorize("isAuthenticated()")
@GetMapping("/api/v1/user/me")
public ResponseEntity<ApiResponse<UserInfo>> getMe(
    @AuthenticationPrincipal UserDetails userDetails
) {
    // userDetails đã được Spring Security validate
    // Chỉ return info của user hiện tại
}
```

---

## ✅ ALTERNATIVE (Nếu không thể thêm /me)

**Backend sửa login response thêm user info:**

```json
{
  "success": true,
  "data": {
    "accessToken": "string",
    "refreshToken": "string",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "fullName": "Nguyễn Văn A",
      "role": "owner"
    }
  }
}
```

**Ưu điểm:**

- Frontend không cần call thêm API
- Login flow nhanh hơn

**Nhược điểm:**

- Phải sửa login response structure
- Khó update user info sau này

---

## 🧪 TEST API

### **Request:**

```bash
curl -X GET http://localhost:8080/api/v1/user/me \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json"
```

### **Expected Response:**

```json
{
  "success": true,
  "code": 0,
  "message": "OK",
  "data": {
    "id": "75ffb0c2-efef-4593-adfd-8c4515f1079d",
    "email": "owner@farm.com",
    "fullName": "Farm Owner",
    "role": "owner"
  },
  "timestamp": "2026-04-07T05:30:00.000Z"
}
```

---

## 📋 CHECKLIST Backend

- [ ] Tạo endpoint GET /api/v1/user/me
- [ ] Require JWT authentication
- [ ] Map roles array → single role string
- [ ] Return user info (id, email, fullName, role)
- [ ] Response format match ApiResponse<UserInfo>
- [ ] Test với Postman/cURL
- [ ] Update Swagger/API docs

---

## 🎯 TIMELINE

**Ưu tiên cao** - Frontend đang block bởi endpoint này

**ETA:** 1-2 hours (simple endpoint)

---

**📞 Liên hệ Frontend team nếu cần clarify response structure!**
