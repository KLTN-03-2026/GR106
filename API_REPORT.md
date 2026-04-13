# Báo cáo tích hợp API (Cập nhật 13/04/2026)

Dự án đã tích hợp thành công **100%** các API được yêu cầu trong đặc tả. Dưới đây là danh sách chi tiết các endpoint đã được call và xác thực trong mã nguồn.

---

## 1. Auth Controller (Xác thực & Phân quyền)
Quản lý luồng đăng nhập, đăng ký và duy trì phiên làm việc.
- **Service file**: `src/services/authService.ts`
- **Trạng thái**: Hoàn tất 100%

| Method | Endpoint | Mô tả | Data Payload |
| :--- | :--- | :--- | :--- |
| POST | `/api/v1/auth/register` | Đăng ký tài khoản | `email, password, fullName` |
| POST | `/api/v1/auth/login` | Đăng nhập hệ thống | `email, password` |
| POST | `/api/v1/auth/verify` | Xác thực tài khoản | `token` |
| POST | `/api/v1/auth/refresh` | Làm mới Token | `refreshToken` |

---

## 2. Farm API (Quản lý Trang trại - Multi-tenant)
Hỗ trợ quản lý đa trang trại và cấp Token riêng cho từng Farm.
- **Service/Store**: `src/services/farmService.ts`, `src/store/farmSlice.ts`
- **Trạng thái**: Hoàn tất 100%

| Method | Endpoint | Mô tả | Ghi chú |
| :--- | :--- | :--- | :--- |
| GET | `/api/v1/farms` | Danh sách farm sở hữu | Trả về thông tin đầy đủ |
| POST | `/api/v1/farms` | Tạo trang trại mới | Payload: `farmName, description` |
| POST | `/api/v1/farms/{id}/select` | Chọn Farm làm việc | Trả về **Farm Token** (quan trọng cho Multi-tenant) |
| GET | `/api/v1/farms/summary` | Tóm tắt trang trại | Dùng cho Dashboard/Sidebar |

---

## 3. Plot API (Quản lý Lô đất)
Quản lý dữ liệu địa lý và trạng thái các lô đất trong farm hiện tại.
- **Store file**: `src/store/plotSlice.ts`
- **Trạng thái**: Hoàn tất 100%

| Method | Endpoint | Mô tả | Ghi chú |
| :--- | :--- | :--- | :--- |
| GET | `/api/v1/plots` | Lấy danh sách lô đất | Trả về GeoJSON coordinates |
| POST | `/api/v1/plots` | Tạo lô đất mới | Cần `plotName, geometry, description` |

---

## 4. Subscription API (Gói dịch vụ)
Quản lý các gói đăng ký (Free, Basic, Pro...) của từng Farm.
- **Service file**: `src/services/subscription/getSubscriptionPlanService.ts`
- **Trạng thái**: Hoàn tất 100%

| Method | Endpoint | Mô tả |
| :--- | :--- | :--- |
| GET | `/api/v1/subscriptions` | Danh sách các gói cước đang cung cấp |
| GET | `/api/v1/subscriptions/current` | Gói cước đang Active của Farm hiện tại |
| GET | `/api/v1/subscriptions/history` | Lịch sử đăng ký/nâng cấp của Farm |

---

## 5. Payment API (Thanh toán SePay)
Tích hợp cổng SePay để thanh toán nâng cấp gói.
- **Service file**: `src/services/payment/createPaymentService.ts`
- **Trạng thái**: Hoàn tất 100%

| Method | Endpoint | Mô tả | Ghi chú |
| :--- | :--- | :--- | :--- |
| POST | `/api/v1/payment/create` | Tạo link thanh toán | Trả về `actionUrl` và `signature` cho SePay |
| POST | `/api/v1/payment/ipn` | IPN Callback | API phía Server gọi (KHÔNG yêu cầu JWT) |

---

## 6. Luồng Multi-tenant (Farm Token Flow)
Hệ thống đã triển khai đúng luồng bảo mật Multi-tenant:
1.  **User Authentication**: Nhận User Token sau khi login.
2.  **Context Selection**: Gọi `selectFarm` API với ID đã chọn.
3.  **Token Upgrade**: Nhận Farm Token (chứa `farmId` và `permissions`).
4.  **Resource Access**: Các API tiếp theo (Plots, Sensors...) sử dụng Farm Token này để đảm bảo cô lập dữ liệu hoàn toàn.

> [!IMPORTANT]
> Toàn bộ logic Validation (Zod) đã được đồng bộ với đặc tả API (ví dụ: `farmName` thay vì `name` trong create-flow).

