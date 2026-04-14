# Báo cáo Tài liệu & Luồng xử lý API (FarmerAI)
**Ngày cập nhật**: 14/04/2026

Dự án FarmerAI được xây dựng trên kiến trúc **Multi-tenant**, đảm bảo tính cô lập dữ liệu giữa các trang trại và tính bảo mật cao thông qua cơ chế quản lý Token kép.

---

## Chương 1: Kiến trúc & Cơ chế xử lý API

### 1.1. Tầng Client API (Axios Configuration)
Ứng dụng sử dụng một instance `axios` tập trung (`src/config/axios.ts`) với các interceptor để quản lý vòng đời của một request.

- **Request Interceptor**: Tự động lấy `accessToken` từ LocalStorage và đính kèm vào Header `Authorization: Bearer <Token>`. Cơ chế này được bỏ qua đối với các "Public Routes" như Login/Register.
- **Response Interceptor (Silent Refresh)**: 
    - Khi nhận mã lỗi **401 (Unauthorized)**, hệ thống tự động tạm dừng các request đang chờ.
    - Một yêu cầu làm mới token (`/api/v1/auth/refresh`) sẽ được gửi ngầm (Silent).
    - Nếu thành công, token mới được lưu vào máy khách, và các request cũ được "retry" tự động mà người dùng không nhận ra sự gián đoạn.
    - Nếu thất bại, người dùng sẽ bị đăng xuất về trang `/login`.

### 1.2. Tầng Validation & Schema (Zod)
Mọi dữ liệu trao đổi với API đều đi qua lớp bảo vệ `Zod` (`src/schemas/`):
- **Input Validation**: Dữ liệu người dùng nhập (Form) được kiểm tra định dạng (email, độ dài mật khẩu, kiểu dữ liệu tọa độ) trước khi gửi đi.
- **Output Sanitization**: Dữ liệu phản hồi từ Server được "parse" lại qua Schema để đảm bảo tính nhất quán của kiểu dữ liệu (ví dụ: chuyển định dạng ngày tháng, xử lý giá trị null).

---

## Chương 2: Danh mục API chi tiết (Endpoint Specification)

### 2.1. Module Xác thực (Auth)
Quản lý phiên làm việc và bảo mật tài khoản.

| Method | Endpoint | Mô tả | Payload Đặc trưng |
| :--- | :--- | :--- | :--- |
| POST | `/api/v1/auth/register` | Đăng ký tài khoản mới | `email, password, fullName` |
| POST | `/api/v1/auth/login` | Đăng nhập lấy JWT | `email, password` |
| POST | `/api/v1/auth/verify` | Kiểm tra token hợp lệ | `token` |
| POST | `/api/v1/auth/refresh` | Làm mới phiên làm việc | `refreshToken` |

### 2.2. Module Trang trại (Farm - Multi-tenant)
Cốt lõi của hệ thống quản lý nhiều trang trại.

| Method | Endpoint | Mô tả | Payload Đặc trưng |
| :--- | :--- | :--- | :--- |
| GET | `/api/v1/farms` | Lấy danh sách trang trại hiện có của user | - |
| POST | `/api/v1/farms` | Tạo mới một trang trại | `farmName, description` |
| POST | `/api/v1/farms/{farmId}/select` | **Chọn farm (Context Switch)** | Trả về `farmToken` |
| GET | `/api/v1/farms/summary` | Lấy thông tin tóm tắt (dashboard) | - |

### 2.3. Module Lô đất & Bản đồ (Plot)
Quản lý dữ liệu địa lý trực thuộc mỗi trang trại.

| Method | Endpoint | Mô tả | Payload Đặc trưng |
| :--- | :--- | :--- | :--- |
| GET | `/api/v1/plots` | Lấy danh sách lô đất của farm | Trả về thông tin và tọa độ (GeoJSON) |
| POST | `/api/v1/plots` | Tạo lô đất mới | `plotName, geometry, description` |

### 2.4. Module Gói dịch vụ (Subscription)
Quản lý subscription của các trang trại.

| Method | Endpoint | Mô tả | Payload Đặc trưng |
| :--- | :--- | :--- | :--- |
| GET | `/api/v1/subscriptions` | Lấy danh mục các gói subscription | - |
| GET | `/api/v1/subscriptions/current`| Lấy gói subscription hiện tại | - |
| GET | `/api/v1/subscriptions/history`| Lấy lịch sử biến động dịch vụ | - |

### 2.5. Module Thanh toán (Payment)
Tạo thanh toán qua SePay và nhận webhooks (IPN).

| Method | Endpoint | Mô tả | Payload Đặc trưng |
| :--- | :--- | :--- | :--- |
| POST | `/api/v1/payment/create` | Tạo link thanh toán Subscription qua SePay | `subscriptionPlanId, billingCycle` |
| POST | `/api/v1/payment/ipn` | IPN callback từ SePay (server-to-server) | `order, transaction` |

---

## Chương 3: Các Luồng xử lý nghiệp vụ chính

### 3.1. Luồng Multi-tenant Context Switch
Đây là luồng quan trọng nhất để ứng dụng biết đang làm việc trên dữ liệu nào.
1.  Người dùng chọn một Farm từ danh sách.
2.  App gọi API `/select` với ID trang trại đó.
3.  Server trả về một **Farm Token** (đã được mã hóa ID Farm và vai trò của người dùng).
4.  App lưu Farm Token và đính kèm vào mọi request liên quan đến Lô đất, Cảm biến, Thành viên sau đó.
5.  **Smart Security**: Hệ thống tự động phát hiện `farmId` từ URL để kích hoạt lại context khi người dùng tải lại trang.

### 3.2. Luồng Thanh toán & Nâng cấp (SePay Workflow)
1.  **Selection**: Người dùng chọn gói (`Basic/Pro`) và chu kỳ (`Tháng/Năm`).
2.  **Creation**: Gọi `/api/v1/payment/create`, Server sinh URL thanh toán SePay.
3.  **Redirection**: Người dùng được chuyển tới giao diện thanh toán SePay.
4.  **IPN Callback**: SePay gọi ngầm tới Server dự án thông qua `/api/v1/payment/ipn` để xác nhận tiền đã vào tài khoản khách hàng.
5.  **Return/Verification**: Sau khi thanh toán trong hệ thống, Client liên tục lắng nghe thay đổi thông qua API `/api/v1/subscriptions/current` để tự động cập nhật UI trạng thái dịch vụ mới.

---

## Chương 4: Quy ước Phản hồi & Xử lý lỗi

### 4.1. Cấu trúc Response chuẩn
```json
{
  "success": true,
  "code": 200,
  "message": "Thao tác thành công",
  "data": { ... },
  "timestamp": "2026-04-13T..."
}
```

### 4.2. Xử lý lỗi tập trung
- **Lỗi 400**: Sai validation (Hiển thị thông báo đỏ từ Zod).
- **Lỗi 401**: Hết hạn phiên (Thực hiện Silent Refresh).
- **Lỗi 403**: Không đủ quyền truy cập (Ví dụ: Worker cố gắng nâng cấp gói).
- **Lỗi 500**: Lỗi hệ thống server (Hiển thị Toast thông báo bảo trì).

---
** FarmerAI Team - Advanced Coding Agent System **
