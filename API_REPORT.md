# Báo cáo các API đang sử dụng trong dự án

Tài liệu này tổng hợp danh sách các API thực tế đang được tích hợp và sử dụng trong mã nguồn của frontend.

## 1. Hệ thống xác thực (Authentication)
Dịch vụ quản lý người dùng và phiên làm việc thông qua `auth-controller`.
- **Service file**: `src/services/authService.ts`
- **Các Endpoint**:

### POST /api/v1/auth/register
Đăng ký tài khoản mới.
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "string",
    "fullName": "string"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "code": 0,
    "message": "string",
    "data": "string",
    "timestamp": "2026-04-12T..."
  }
  ```

### POST /api/v1/auth/login
Đăng nhập để nhận token.
- **Request Body**:
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "code": 0,
    "message": "string",
    "data": {
      "accessToken": "string",
      "refreshToken": "string"
    },
    "timestamp": "2026-04-12T..."
  }
  ```

### POST /api/v1/auth/verify
Xác thực tài khoản qua token email.
- **Request Body**: `{ "token": "string" }`
- **Response**: `{ "success": true, "data": "string", ... }`

### POST /api/v1/auth/refresh
Làm mới Access Token.
- **Request Body**: `{ "refreshToken": "string" }`
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "accessToken": "string",
      "refreshToken": "string"
    },
    ...
  }
  ```

---

## 2. Quản lý Trang trại (Farm Management)
Quản lý danh sách và thông tin chi tiết các nông trại.
- **Service file**: `src/services/farmService.ts`, `src/store/farmSlice.ts`
- **Các Endpoint**:
    - `POST /api/v1/farms`: Tạo trang trại mới.
    - `GET /api/v1/farms`: Lấy toàn bộ danh sách trang trại mà người dùng đang sở hữu.
    - `GET /api/v1/farms/summary`: Lấy thông tin tổng quan các farm (farmId, farmName, myRole, owner...).
    - `POST /api/v1/farms/{id}/select`: Chọn trang trại để làm việc và nhận `farmToken`.

## 3. Quản lý Gói cước & Thanh toán
Xử lý các dịch vụ đăng ký gói và thanh toán qua cổng SePay.

### Subscription API
- **Service file**: `src/services/subscription/getSubscriptionPlanService.ts`
- **Endpoints**:
    - `GET /api/v1/subscriptions`: Lấy danh sách các gói dịch vụ.
    - `GET /api/v1/subscriptions/current`: Lấy thông tin gói active của farm.
    - `GET /api/v1/subscriptions/history`: Lấy lịch sử đăng ký của farm.

### Payment API (SePay)
- **Service file**: `src/services/payment/createPaymentService.ts`
- **Endpoints**:
    - `POST /api/v1/payment/create`: Tạo link thanh toán SePay.
    - `POST /api/v1/payment/ipn`: Callback từ SePay (Server-to-server).

## 4. Dịch vụ Thời tiết (External API)
- **Service file**: `src/services/weatherService.ts`
- **Endpoint**: `GET https://api.openweathermap.org/data/2.5/weather`

## 5. Quản lý Lô đất (Plots)
- **Store file**: `src/store/plotSlice.ts`
- **Các Endpoint**:
    - `GET /api/v1/plots`: Lấy danh sách toàn bộ lô đất.
    - `POST /api/v1/plots`: Tạo lô đất mới.

---
## 6. Luồng xử lý Hệ thống (System Flow)

### Luồng Đăng ký & Khởi tạo (Reg-to-Farm Flow) [MỚI]
Để tối ưu trải nghiệm người dùng, hệ thống thực hiện 3 bước liên tiếp khi đăng ký:
1. **Đăng ký**: Gọi `auth/register`.
2. **Đăng nhập tự động**: Gọi `auth/login` ngay lập tức để lấy Token.
3. **Tạo Trang trại**: Sử dụng Token vừa có để gọi `POST /api/v1/farms` với tên trang trại người dùng đã nhập.
4. **Kết quả**: Người dùng được đưa thẳng vào Dashboard với trang trại đầu tiên đã sẵn sàng.

### Luồng Thanh toán & Nâng cấp (Subscription Flow)
1. **Chọn Gói**: Tại Pricing (`/subscription/pricing`).
2. **Xác nhận Trang trại**: Modal chọn trang trại nếu cần.
3. **Thanh toán SePay**: Chuyển hướng sang cổng SePay.
